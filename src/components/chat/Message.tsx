'use client';

import React from 'react';
import { Message as MessageType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MessageProps {
  message: MessageType;
  onRetry?: () => void;
}

export function Message({ message, onRetry }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return null; // Don't render system messages
  }

  return (
    <div
      className={cn(
        'flex w-full gap-3 px-4 py-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
          AI
        </div>
      )}
      
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        <Card
          className={cn(
            'px-4 py-3 text-sm',
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted',
            message.error && 'border-destructive bg-destructive/10'
          )}
        >
          {message.error ? (
            <div className="space-y-2">
              <p className="text-destructive font-medium">Error occurred</p>
              <p className="text-destructive/80 text-xs">{message.error}</p>
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="text-xs h-6"
                >
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap">
              {message.content}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-current opacity-75 animate-pulse ml-1" />
              )}
            </div>
          )}
        </Card>
        
        <time className="text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </time>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
          You
        </div>
      )}
    </div>
  );
}