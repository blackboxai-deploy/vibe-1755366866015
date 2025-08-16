'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, ChatSession, ChatSettings } from '@/lib/types';
import { ChatStorage } from '@/lib/storage';

export function useChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ChatSettings>(ChatStorage.getSettings());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  const loadSessions = useCallback(() => {
    const loadedSessions = ChatStorage.getSessions();
    setSessions(loadedSessions);
    
    const savedCurrentId = ChatStorage.getCurrentSessionId();
    if (savedCurrentId && loadedSessions.find(s => s.id === savedCurrentId)) {
      setCurrentSessionId(savedCurrentId);
    } else if (loadedSessions.length > 0) {
      setCurrentSessionId(loadedSessions[0].id);
    }
  }, []);

  const saveSessions = useCallback((newSessions: ChatSession[]) => {
    setSessions(newSessions);
    ChatStorage.saveSessions(newSessions);
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newSessions = [newSession, ...sessions];
    saveSessions(newSessions);
    setCurrentSessionId(newSession.id);
    ChatStorage.setCurrentSessionId(newSession.id);
    
    return newSession.id;
  }, [sessions, saveSessions]);

  const updateSession = useCallback((sessionId: string, updates: Partial<ChatSession>) => {
    const newSessions = sessions.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: new Date() }
        : session
    );
    saveSessions(newSessions);
  }, [sessions, saveSessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(newSessions);
    
    if (currentSessionId === sessionId) {
      const newCurrentId = newSessions.length > 0 ? newSessions[0].id : null;
      setCurrentSessionId(newCurrentId);
      ChatStorage.setCurrentSessionId(newCurrentId);
    }
  }, [sessions, currentSessionId, saveSessions]);

  const addMessage = useCallback((sessionId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    updateSession(sessionId, {
      messages: [...(currentSession?.messages || []), newMessage],
      title: currentSession?.title === 'New Chat' && message.role === 'user' 
        ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
        : currentSession?.title || 'New Chat'
    });

    return newMessage.id;
  }, [currentSession, updateSession]);

  const updateMessage = useCallback((sessionId: string, messageId: string, updates: Partial<Message>) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newMessages = session.messages.map(msg => 
      msg.id === messageId ? { ...msg, ...updates } : msg
    );

    updateSession(sessionId, { messages: newMessages });
  }, [sessions, updateSession]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }

    // Add user message
    const userMessageId = addMessage(sessionId, {
      role: 'user',
      content: content.trim(),
    });

    // Add assistant message placeholder
    const assistantMessageId = addMessage(sessionId, {
      role: 'assistant',
      content: '',
      isStreaming: true,
    });

    try {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: settings.systemPrompt },
            ...(sessions.find(s => s.id === sessionId)?.messages.slice(0, -1) || [])
              .map(msg => ({ role: msg.role, content: msg.content }))
          ],
          settings,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || parsed.content;
              
              if (content) {
                assistantContent += content;
                updateMessage(sessionId, assistantMessageId, {
                  content: assistantContent,
                  isStreaming: true,
                });
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }

      // Finalize the message
      updateMessage(sessionId, assistantMessageId, {
        content: assistantContent,
        isStreaming: false,
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      console.error('Chat error:', error);
      setError(error.message || 'Failed to send message');
      
      updateMessage(sessionId, assistantMessageId, {
        content: '',
        isStreaming: false,
        error: error.message || 'Failed to send message',
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [
    currentSessionId, 
    isLoading, 
    settings, 
    sessions,
    createNewSession, 
    addMessage, 
    updateMessage
  ]);

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    ChatStorage.saveSettings(updatedSettings);
  }, [settings]);

  const switchSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    ChatStorage.setCurrentSessionId(sessionId);
  }, []);

  return {
    sessions,
    currentSession,
    currentSessionId,
    settings,
    isLoading,
    error,
    loadSessions,
    createNewSession,
    deleteSession,
    sendMessage,
    cancelGeneration,
    updateSettings,
    switchSession,
  };
}