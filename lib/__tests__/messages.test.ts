// File: lib/__tests__/messages.test.ts
// Role: Tests for message utilities (partsToText, clipMessages)
import { describe, expect, it } from "vitest";
import { clipMessages, partsToText } from "../utils/messages";

describe("messages utils", () => {
  it("partsToText joins only text parts", () => {
    const out = partsToText([
      { type: "text", text: "A" },
      { type: "image" },
      { type: "text", text: "B" },
    ]);
    expect(out).toBe("AB");
  });

  it("clipMessages keeps last N and maps content", () => {
    const msgs = Array.from({ length: 8 }).map((_, i) => ({
      role: i % 2 ? "assistant" : ("user" as const),
      parts: [{ type: "text", text: String(i) }],
    }));
    const clipped = clipMessages(msgs, 6);
    expect(clipped).toHaveLength(6);
    expect(clipped[0].content).toBe("2");
    expect(clipped[5].content).toBe("7");
  });
});
