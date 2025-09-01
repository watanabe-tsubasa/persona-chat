// File: lib/utils/messages.ts
// Role: Chat message utilities (parts→text conversion and clipping)
import type { ChatMessage } from "@/lib/schemas/chat";

export function partsToText(parts?: ChatMessage["parts"]): string {
  if (!parts || parts.length === 0) return "";
  return parts.map((p) => (p.type === "text" ? (p.text ?? "") : "")).join("");
}

export function clipMessages<T extends ChatMessage>(messages: T[], lastN = 6) {
  return messages
    .slice(-lastN)
    .map((m) => ({ role: m.role, content: partsToText(m.parts) }));
}
