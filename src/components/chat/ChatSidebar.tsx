'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChatContext } from '@/components/providers/ChatProvider';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ isOpen, onClose }: ChatSidebarProps) {
  const {
    sessions,
    currentSessionId,
    settings,
    createNewSession,
    deleteSession,
    switchSession,
    updateSettings,
  } = useChatContext();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState(settings.systemPrompt);

  const handleNewChat = () => {
    createNewSession();
    onClose();
  };

  const handleSessionClick = (sessionId: string) => {
    switchSession(sessionId);
    onClose();
  };

  const handleSaveSettings = () => {
    updateSettings({
      systemPrompt: tempSystemPrompt,
    });
    setSettingsOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-full w-80 bg-background border-r z-50 transform transition-transform duration-200 ease-in-out',
          'lg:relative lg:transform-none lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">AI Chat</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                ✕
              </Button>
            </div>
            <Button
              onClick={handleNewChat}
              className="w-full mt-3"
              size="sm"
            >
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card
                  key={session.id}
                  className={cn(
                    'p-3 cursor-pointer hover:bg-accent transition-colors',
                    session.id === currentSessionId && 'bg-accent border-primary'
                  )}
                  onClick={() => handleSessionClick(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">
                        {session.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this chat?')) {
                          deleteSession(session.id);
                        }
                      }}
                      className="ml-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                </Card>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  No chat sessions yet
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Settings */}
          <div className="p-4 border-t">
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Chat Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="model">AI Model</Label>
                    <Select
                      value={settings.model}
                      onValueChange={(value) => updateSettings({ model: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openrouter/anthropic/claude-sonnet-4">
                          Claude Sonnet 4
                        </SelectItem>
                        <SelectItem value="openrouter/openai/gpt-4o">
                          GPT-4o
                        </SelectItem>
                        <SelectItem value="openrouter/google/gemini-pro">
                          Gemini Pro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      value={tempSystemPrompt}
                      onChange={(e) => setTempSystemPrompt(e.target.value)}
                      placeholder="Enter system prompt..."
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This prompt defines the AI's behavior and personality.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTempSystemPrompt(settings.systemPrompt);
                        setSettingsOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSaveSettings}>
                      Save Settings
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}