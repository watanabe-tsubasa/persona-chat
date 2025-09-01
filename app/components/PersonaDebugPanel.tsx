// File: app/components/PersonaDebugPanel.tsx
// Role: Debug panel to set personaId manually and fetch persona info
"use client";

import React from "react";
import type { PersonaRow } from "@/lib/schemas/persona";

type Persona = Pick<PersonaRow, "id" | "name" | "persona_prompt" | "examples">;

type Props = {
  personaId: string | null;
  onSetPersonaId: (id: string | null) => void;
};

export default function PersonaDebugPanel({
  personaId,
  onSetPersonaId,
}: Props) {
  const [manualPersonaInput, setManualPersonaInput] = React.useState("");
  const [personaInfo, setPersonaInfo] = React.useState<Persona | null>(null);

  return (
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
          onClick={() => onSetPersonaId(manualPersonaInput || null)}
          type="button"
        >
          セット
        </button>
        <button
          className="bg-indigo-600 text-white px-3 py-2 rounded disabled:opacity-50"
          onClick={async () => {
            const id = manualPersonaInput || personaId;
            if (!id) return;
            try {
              const r = await fetch(
                `/api/getpersona?id=${encodeURIComponent(id)}`,
              );
              const data = await r.json();
              setPersonaInfo(data.persona ?? null);
            } catch (err) {
              console.error("fetch persona failed", err);
              setPersonaInfo(null);
            }
          }}
          disabled={!manualPersonaInput && !personaId}
          type="button"
        >
          取得
        </button>
      </div>
      {personaId && (
        <div className="text-sm text-gray-600">
          現在の Persona ID: {personaId}
        </div>
      )}
      {personaInfo && (
        <pre className="text-xs bg-gray-50 border rounded p-2 overflow-auto max-h-60">
          {JSON.stringify(personaInfo, null, 2)}
        </pre>
      )}
    </section>
  );
}
