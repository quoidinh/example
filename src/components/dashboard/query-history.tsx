'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface QueryEntry {
  id: string;
  question: string;
  answer: string;
  confidence: string;
  created_at: string;
}

interface QueryHistoryProps {
  queries: QueryEntry[];
}

export function QueryHistory({ queries }: QueryHistoryProps) {
  const getConfidenceColor = (conf: string) => {
    switch (conf.toLowerCase()) {
      case 'high': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="shadow-lg border-emerald-50 overflow-hidden">
      <CardHeader className="bg-white border-b pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-emerald-600" size={20} />
          <CardTitle className="text-lg">Recent AI Queries</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Review your last 5 intelligence searches</p>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[280px]">
          {queries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-2 text-muted-foreground">
              <Clock size={32} className="opacity-20 transition-all hover:rotate-12 duration-500" />
              <p className="text-sm italic">No query history yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {queries.map((q) => (
                <div 
                  key={q.id} 
                  className="p-4 hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <Badge variant="outline" className={`text-[9px] uppercase px-1.5 py-0 h-4 ${getConfidenceColor(q.confidence)}`}>
                      {q.confidence}
                    </Badge>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-800 line-clamp-2 pr-4 group-hover:text-emerald-700 transition-colors">
                    {q.question}
                  </h4>
                  
                  <div className="mt-2 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      View details <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
