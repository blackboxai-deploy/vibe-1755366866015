import { ChatSession, ChatSettings } from './types';

const SESSIONS_KEY = 'ai-chat-sessions';
const SETTINGS_KEY = 'ai-chat-settings';
const CURRENT_SESSION_KEY = 'ai-chat-current-session';

export const defaultSettings: ChatSettings = {
  model: 'openrouter/anthropic/claude-sonnet-4',
  systemPrompt: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses to user questions. Be concise but thorough in your explanations.',
  temperature: 0.7,
  maxTokens: 4000,
};

export class ChatStorage {
  static getSessions(): ChatSession[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(SESSIONS_KEY);
      if (!stored) return [];
      
      const sessions = JSON.parse(stored);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Error loading sessions from storage:', error);
      return [];
    }
  }

  static saveSessions(sessions: ChatSession[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions to storage:', error);
    }
  }

  static getSettings(): ChatSettings {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) return defaultSettings;
      
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (error) {
      console.error('Error loading settings from storage:', error);
      return defaultSettings;
    }
  }

  static saveSettings(settings: ChatSettings): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  }

  static getCurrentSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error loading current session ID from storage:', error);
      return null;
    }
  }

  static setCurrentSessionId(sessionId: string | null): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (sessionId) {
        localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
      } else {
        localStorage.removeItem(CURRENT_SESSION_KEY);
      }
    } catch (error) {
      console.error('Error saving current session ID to storage:', error);
    }
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(SESSIONS_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem(CURRENT_SESSION_KEY);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}