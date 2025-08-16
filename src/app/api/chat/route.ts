import { NextRequest, NextResponse } from 'next/server';
import { OpenRouterMessage, ChatSettings } from '@/lib/types';

const OPENROUTER_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';

const HEADERS = {
  'customerId': 'cus_SGPn4uhjPI0F4w',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
};

export async function POST(request: NextRequest) {
  try {
    const { messages, settings }: { 
      messages: OpenRouterMessage[]; 
      settings: ChatSettings;
    } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const requestBody = {
      model: settings.model || 'openrouter/anthropic/claude-sonnet-4',
      messages: messages,
      stream: true,
      temperature: settings.temperature || 0.7,
      max_tokens: settings.maxTokens || 4000,
    };

    const response = await fetch(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}` },
        { status: response.status }
      );
    }

    // Create a readable stream to forward the SSE response
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.trim()) {
                // Forward the SSE data as-is
                controller.enqueue(encoder.encode(`${line}\n`));
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}