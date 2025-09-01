// File: app/page.tsx
// Role: Main client page for persona creation, debug panel, and chat UI
"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import React, { useCallback, useState } from "react";
import PersonaDebugPanel from "./components/PersonaDebugPanel";

export default function Page() {
  const [personaId, setPersonaId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logs, setLogs] = useState("");
  // Debug UI 内部へ移動: manualPersonaInput, personaInfo はパネル内に保持

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const [input, setInput] = React.useState("");

  const createPersona = useCallback(async () => {
    const r = await fetch("/api/personas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: "demo", name, logs }),
    });
    const data = (await r.json()) as { personaId?: string };
    if (data.personaId) setPersonaId(data.personaId);
  }, [name, logs]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Debug: manually set personaId and fetch persona info */}
      <PersonaDebugPanel personaId={personaId} onSetPersonaId={setPersonaId} />
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
            type="button"
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
                  m.role === "user" ? "bg-white" : "bg-gray-50"
                }`}
              >
                <b>{m.role}:</b>{" "}
                {m.parts.map((p) =>
                  p.type === "text" ? (
                    <span key={`${m.id}-${p.text}`}>{p.text}</span>
                  ) : null,
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = input.trim();
              if (text) {
                sendMessage({ text }, { body: { personaId } });
                setInput("");
              }
            }}
            className="flex gap-2"
          >
            <input
              className="border p-2 flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status !== "ready"}
              placeholder="メッセージを入力"
            />
            <button
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              type="submit"
              disabled={status !== "ready"}
            >
              送信
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
