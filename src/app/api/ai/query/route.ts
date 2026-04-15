import { getOpenAIClient } from '@/lib/openai';
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

    // --- BONUS: Rate Limiting (20 per hour) ---
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

    // --- 1. Fetch relevant data from Supabase ---
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

    // --- 2. Call OpenAI with Streaming ---
    const openai = getOpenAIClient();
    
    // We first get the sources and confidence via a non-streaming tool call or structured output 
    // to provide it immediately, then stream the answer.
    // However, to keep it as a single stream, we'll ask the AI to provide it in a fixed format 
    // or just use Structured Outputs for the non-streaming part.
    
    // For the BONUS, we'll implement a simple stream.
    const streamResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI Product Intelligence Assistant for Switch Supply.
          Provide a natural language answer based on the context. 
          Respond in a format that we can parse:
          [METADATA]{"confidence": "high"|"medium"|"low", "sources": [{"name": "...", "sku": "..."}]}[/METADATA]
          [ANSWER]Your data-backed answer here...[/ANSWER]
          
          Product Context:
          ${JSON.stringify(productContext)}`
        },
        { role: 'user', content: question }
      ],
      stream: true,
    });

    // --- 3. Return a ReadableStream ---
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullAnswer = '';
        for await (const chunk of streamResponse) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullAnswer += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        
        // After streaming is done, we've collected the full response.
        // We SHOULD save it to the DB now. 
        // Parsing the full response to extract metadata for the DB.
        try {
          const metaMatch = fullAnswer.match(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/);
          const answerMatch = fullAnswer.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
          
          const metadata = metaMatch ? JSON.parse(metaMatch[1]) : { confidence: 'medium', sources: [] };
          const finalAnswer = answerMatch ? answerMatch[1] : fullAnswer.replace(/\[METADATA\][\s\S]*?\[\/METADATA\]/, '').replace(/\[ANSWER\]|\[\/ANSWER\]/g, '');

          await supabase.from('query_history').insert({
            user_id: user.id,
            question: question,
            answer: finalAnswer.trim(),
            confidence: metadata.confidence,
            sources: metadata.sources
          });
        } catch (e) {
          console.error('Error saving query history:', e);
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('AI Query Error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.', details: error.message },
      { status: 500 }
    );
  }
}
