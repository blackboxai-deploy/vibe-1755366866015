'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { useChatContext } from '@/components/providers/ChatProvider';
import { ScrollArea } from '@/components/ui/scroll-area';

export function MessageList() {
  const { currentSession, sendMessage } = useChatContext();
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages]);

  const handleRetry = (messageContent: string) => {
    sendMessage(messageContent);
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Welcome to AI Chat</h3>
          <p className="text-muted-foreground">
            Start a conversation by typing a message below
          </p>
        </div>
      </div>
    );
  }

  const messages = currentSession.messages;

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">New Conversation</h3>
          <p className="text-muted-foreground">
            Send a message to start chatting with AI
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1" ref={scrollRef}>
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => {
          // Find the previous user message for retry functionality
          const previousUserMessage = messages
            .slice(0, messages.indexOf(message))
            .reverse()
            .find(m => m.role === 'user');

          return (
            <Message
              key={message.id}
              message={message}
              onRetry={
                message.error && previousUserMessage
                  ? () => handleRetry(previousUserMessage.content)
                  : undefined
              }
            />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}