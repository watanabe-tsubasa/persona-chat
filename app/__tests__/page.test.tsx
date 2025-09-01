import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock AI SDK hooks/classes used by the page component
vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({ messages: [], sendMessage: vi.fn(), status: "ready" }),
}));
vi.mock("ai", () => ({
  DefaultChatTransport: class {},
}));

import Page from "../page";

describe("Home Page", () => {
  it("renders persona creation controls by default", () => {
    render(<Page />);
    // Button label is in Japanese in the component
    expect(
      screen.getByRole("button", { name: "人格を作成" }),
    ).toBeInTheDocument();
  });
});
