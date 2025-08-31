'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react'; 
import { DefaultChatTransport } from 'ai';

export default function Page() {
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logs, setLogs] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { personaId }, // personaId を渡す
    }),
  });

  const [input, setInput] = useState('');

  async function createPersona() {
    const r = await fetch('/api/personas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'demo', name, logs }),
    });
    const data = await r.json();
    if (data.personaId) setPersonaId(data.personaId);
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {!personaId && (
        <section className="space-y-3">
          <input
            className="border p-2 w-full"
            placeholder="相手の表示名"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="border p-2 w-full h-40"
            placeholder="LINE会話履歴を貼り付け"
            value={logs}
            onChange={(e) => setLogs(e.target.value)}
          />
          <button
            onClick={createPersona}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            人格を作成
          </button>
        </section>
      )}

      {personaId && (
        <section className="space-y-4">
          <div className="text-sm text-gray-600">Persona: {personaId}</div>

          <div className="space-y-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`border rounded p-2 ${
                  m.role === 'user' ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <b>{m.role}:</b>{' '}
                {m.parts.map((p, idx) =>
                  p.type === 'text' ? <span key={idx}>{p.text}</span> : null,
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) {
                sendMessage({ text: input });
                setInput('');
              }
            }}
            className="flex gap-2"
          >
            <input
              className="border p-2 flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== 'ready'}
              placeholder="メッセージを入力"
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={status !== 'ready'}
            >
              送信
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
