// File: lib/schemas/chat.ts
// Role: Zod schemas/types for /api/chat request validation
import { z } from "zod";

export const ChatPartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
});

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  parts: z.array(ChatPartSchema).optional(),
});

export const ChatRequestSchema = z.object({
  personaId: z.string().min(1).optional(),
  messages: z.array(ChatMessageSchema),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatPart = z.infer<typeof ChatPartSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
