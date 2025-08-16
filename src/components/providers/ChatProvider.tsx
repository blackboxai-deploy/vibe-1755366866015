'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message, ChatSession, ChatSettings } from '@/lib/types';

interface ChatContextType {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  currentSessionId: string | null;
  settings: ChatSettings;
  isLoading: boolean;
  error: string | null;
  loadSessions: () => void;
  createNewSession: () => string;
  deleteSession: (sessionId: string) => void;
  sendMessage: (content: string) => Promise<void>;
  cancelGeneration: () => void;
  updateSettings: (newSettings: Partial<ChatSettings>) => void;
  switchSession: (sessionId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const chatHook = useChat();

  useEffect(() => {
    chatHook.loadSessions();
  }, []);

  return (
    <ChatContext.Provider value={chatHook}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}