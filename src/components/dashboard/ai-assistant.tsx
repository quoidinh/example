'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Bot, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  confidence?: string;
  isStreaming?: boolean;
}

export function AiAssistant() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setLoading(true);
    setError(null);
    
    setHistory(prev => [...prev, { role: 'user', content: currentQuestion }]);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to get answer from AI');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader available');

      // Add a placeholder message for the assistant
      setHistory(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      let fullText = '';
      const decoder = new TextEncoder().encode('').constructor === Uint8Array ? new TextDecoder() : null; // Safety check
      const actualDecoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = actualDecoder.decode(value, { stream: true });
        fullText += chunk;

        // Try to parse metadata and answer from the accumulated text
        const metaMatch = fullText.match(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/);
        const answerMatch = fullText.match(/\[ANSWER\]([\s\S]*?)\[\/ANSWER\]/);
        
        let displayContent = fullText;
        let sources = [];
        let confidence = '';

        if (metaMatch) {
          try {
            const metadata = JSON.parse(metaMatch[1]);
            sources = metadata.sources;
            confidence = metadata.confidence;
          } catch (e) {}
          // Hide metadata from display
          displayContent = fullText.replace(/\[METADATA\]([\s\S]*?)\[\/METADATA\]/, '');
        }
        
        if (answerMatch) {
          displayContent = answerMatch[1];
        } else {
          // If we haven't seen [ANSWER] tags yet, just show the text sans metadata
          displayContent = displayContent.replace(/\[ANSWER\]|\[\/ANSWER\]/g, '');
        }

        setHistory(prev => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          newHistory[lastIndex] = {
            ...newHistory[lastIndex],
            content: displayContent,
            sources: sources.length > 0 ? sources : newHistory[lastIndex].sources,
            confidence: confidence || newHistory[lastIndex].confidence,
          };
          return newHistory;
        });
      }

      // Mark streaming as finished
      setHistory(prev => {
        const newHistory = [...prev];
        const lastIndex = newHistory.length - 1;
        newHistory[lastIndex].isStreaming = false;
        return newHistory;
      });

    } catch (err: any) {
      setError(err.message);
      // Remove the failed assistant message if it was added
      setHistory(prev => prev[prev.length - 1]?.role === 'assistant' && prev[prev.length - 1]?.isStreaming ? prev.slice(0, -1) : prev);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (conf?: string) => {
    switch (conf) {
      case 'high': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col shadow-xl border-emerald-100">
      <CardHeader className="border-b bg-emerald-50/30">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-600 rounded-lg text-white">
            <Bot size={20} />
          </div>
          <div>
            <CardTitle className="text-lg">AI Assistant <Badge variant="outline" className="ml-2 text-[10px] text-emerald-600 border-emerald-200">Streaming</Badge></CardTitle>
            <p className="text-xs text-muted-foreground">Real-time supply chain insights</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-6">
            {history.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center space-y-3 opacity-60">
                <Info size={32} className="text-emerald-600" />
                <p className="text-sm">Try asking:<br/>"Which ingredients are low on stock?"<br/>"What is the average price of powders?"</p>
              </div>
            )}
            
            {history.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
                }`}>
                  {msg.content || (msg.isStreaming ? '...' : '')}
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="mt-2 flex flex-col gap-2 w-full max-w-[90%] animate-in fade-in slide-in-from-top-1 duration-300">
                    {msg.confidence && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Confidence</span>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-4 border ${getConfidenceColor(msg.confidence)}`}>
                          {msg.confidence}
                        </Badge>
                      </div>
                    )}
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="bg-white border rounded-lg p-2 text-[10px] shadow-sm">
                        <div className="font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <CheckCircle2 size={10} className="text-emerald-500" /> SOURCED DATA
                        </div>
                        <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                          {msg.sources.slice(0, 3).map((s: any, j) => (
                            <li key={j} className="truncate">
                              {s.name || s.product_name} ({s.sku})
                            </li>
                          ))}
                          {msg.sources.length > 3 && (
                            <li className="list-none text-emerald-600 font-medium">+{msg.sources.length - 3} more references</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs border border-red-100">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t bg-white">
        <form onSubmit={handleQuery} className="flex w-full gap-2">
          <Input 
            placeholder="Ask anything..." 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className="flex-1 focus-visible:ring-emerald-600"
          />
          <Button type="submit" size="icon" disabled={loading || !question.trim()} className="bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all active:scale-95">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
