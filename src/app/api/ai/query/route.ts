import { getOpenAIClient } from '@/lib/openai';
import { geminiModel } from '@/lib/gemini';
import { groq } from '@/lib/groq';
import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // --- RATE LIMITING (20 per hour) ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('query_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gt('created_at', oneHourAgo);

    if (countError) throw countError;
    if (count !== null && count >= 20) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. You can only make 20 AI queries per hour.' 
      }, { status: 429 });
    }

    // --- FETCH PRODUCT CONTEXT ---
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('*, price_history(price, date_recorded)')
      .order('name');

    if (dbError) throw dbError;

    const productContext = products.map(p => ({
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.unit_price,
      stock: p.stock_quantity,
      unit: p.unit_of_measure,
      supplier: p.supplier_name,
      origin: p.country_of_origin,
      history: p.price_history
    }));

    const systemPrompt = `You are an AI Product Intelligence Assistant for Switch Supply.
    Provide a natural language answer based on the context. 
    Respond in a format that we can parse:
    [METADATA]{"confidence": "high"|"medium"|"low", "sources": [{"name": "...", "sku": "..."}]}[/METADATA]
    [ANSWER]Your data-backed answer here...[/ANSWER]
    
    Product Context:
    ${JSON.stringify(productContext)}`;

    const provider = process.env.AI_PROVIDER || 'groq';
    console.log(`Using AI Provider: ${provider}`);
    const encoder = new TextEncoder();

    if (provider === 'groq') {
      const streamResponse = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          let fullAnswer = '';
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullAnswer += content;
                controller.enqueue(encoder.encode(content));
              }
            }
            await saveToHistory(supabase, user.id, question, fullAnswer);
          } catch (err) {
            console.error('Groq Stream Error:', err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });

    } else if (provider === 'gemini') {
      const result = await geminiModel.generateContentStream({
        contents: [
          { role: 'user', parts: [{ text: `System: ${systemPrompt}\n\nUser: ${question}` }] }
        ],
      });

      const stream = new ReadableStream({
        async start(controller) {
          let fullAnswer = '';
          try {
            for await (const chunk of result.stream) {
              // Ensure we have a candidate and text to avoid crashes
              if (chunk.candidates && chunk.candidates.length > 0) {
                const content = chunk.text();
                if (content) {
                  fullAnswer += content;
                  controller.enqueue(encoder.encode(content));
                }
              }
            }
            await saveToHistory(supabase, user.id, question, fullAnswer);
          } catch (err) {
            console.error('Gemini Stream Error:', err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });

    } else {
      const openai = getOpenAIClient();
      const streamResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          let fullAnswer = '';
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullAnswer += content;
                controller.enqueue(encoder.encode(content));
              }
            }
            await saveToHistory(supabase, user.id, question, fullAnswer);
          } catch (err) {
            console.error('OpenAI Stream Error:', err);
            controller.error(err);
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      });
    }

  } catch (error: any) {
    console.error('AI Query Error:', error);
    // Explicitly log more details
    if (error.response) {
      console.error('Error Response Data:', await error.response.json().catch(() => 'No JSON response'));
    }
    return NextResponse.json(
      { error: 'An error occurred while processing your request.', details: error.message },
      { status: 500 }
    );
  }
}

async function saveToHistory(supabase: any, userId: string, question: string, fullAnswer: string) {
  try {
    const metaMatch = fullAnswer.match(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/);
    const answerMatch = fullAnswer.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
    
    const metadata = metaMatch ? JSON.parse(metaMatch[1]) : { confidence: 'medium', sources: [] };
    const finalAnswer = answerMatch ? answerMatch[1] : fullAnswer.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '').replace(/\[ANSWER\]|\[\/ANSWER\]/g, '');

    await supabase.from('query_history').insert({
      user_id: userId,
      question: question,
      answer: finalAnswer.trim(),
      confidence: metadata.confidence,
      sources: metadata.sources
    });
  } catch (e) {
    console.error('Error saving query history:', e);
  }
}
