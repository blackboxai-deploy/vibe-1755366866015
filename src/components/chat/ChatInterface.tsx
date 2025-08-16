'use client';

import React, { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { ChatSidebar } from './ChatSidebar';
import { Button } from '@/components/ui/button';
import { useChatContext } from '@/components/providers/ChatProvider';

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentSession, settings, isLoading } = useChatContext();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                ☰
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {currentSession?.title || 'AI Chat'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {settings.model.replace('openrouter/', '')}
                  {isLoading && ' • Generating...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="hidden lg:flex"
              >
                History
              </Button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <MessageList />

        {/* Input */}
        <MessageInput />
      </div>
    </div>
  );
}