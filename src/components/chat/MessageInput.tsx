'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChatContext } from '@/components/providers/ChatProvider';
import { cn } from '@/lib/utils';

export function MessageInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, cancelGeneration } = useChatContext();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="border-t bg-background p-4">
      <div className="flex gap-2 items-end max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type your message... (Ctrl+Enter to send)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={cn(
              'min-h-[60px] max-h-[200px] resize-none pr-12',
              'focus:ring-2 focus:ring-primary/20'
            )}
            rows={1}
          />
          <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {input.length}/4000
          </div>
        </div>
        
        <div className="flex gap-2">
          {isLoading ? (
            <Button
              onClick={cancelGeneration}
              variant="outline"
              className="shrink-0"
            >
              Cancel
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="shrink-0"
            >
              Send
            </Button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-center mt-2">
        Press Ctrl+Enter to send • Use Shift+Enter for new line
      </div>
    </div>
  );
}