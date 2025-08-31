'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react'; 
import { DefaultChatTransport } from 'ai';

export default function Page() {
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [logs, setLogs] = useState('');
  const [manualPersonaInput, setManualPersonaInput] = useState('');
  const [personaInfo, setPersonaInfo] = useState<any | null>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
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
      {/* Debug: manually set personaId and fetch persona info */}
      <section className="space-y-3 border rounded p-3">
        <div className="font-semibold">Debug: Persona ID</div>
        <div className="flex gap-2 items-center">
          <input
            className="border p-2 flex-1"
            placeholder="personaId を手動入力"
            value={manualPersonaInput}
            onChange={(e) => setManualPersonaInput(e.target.value)}
          />
          <button
            className="bg-gray-700 text-white px-3 py-2 rounded"
            onClick={() => setPersonaId(manualPersonaInput || null)}
          >
            セット
          </button>
          <button
            className="bg-indigo-600 text-white px-3 py-2 rounded disabled:opacity-50"
            onClick={async () => {
              const id = manualPersonaInput || personaId;
              if (!id) return;
              try {
                const r = await fetch(`/api/getpersona?id=${encodeURIComponent(id)}`);
                const data = await r.json();
                setPersonaInfo(data.persona ?? null);
              } catch (err) {
                console.error('fetch persona failed', err);
                setPersonaInfo(null);
              }
            }}
            disabled={!manualPersonaInput && !personaId}
          >
            取得
          </button>
        </div>
        {personaId && (
          <div className="text-sm text-gray-600">現在の Persona ID: {personaId}</div>
        )}
        {personaInfo && (
          <pre className="text-xs bg-gray-50 border rounded p-2 overflow-auto max-h-60">
            {JSON.stringify(personaInfo, null, 2)}
          </pre>
        )}
      </section>
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
                sendMessage(
                  { text: input },
                  { body: { personaId }}
                );
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
