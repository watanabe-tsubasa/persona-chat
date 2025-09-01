// File: lib/logger.ts
// Role: Lightweight structured logger with level gating for Edge/runtime
type Level = "debug" | "info" | "warn" | "error";

const levelPriority: Record<Level, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: Level = (process.env.LOG_LEVEL as Level) || "info";

function shouldLog(level: Level) {
  return levelPriority[level] >= levelPriority[currentLevel];
}

export const logger = {
  debug: (msg: string, meta?: unknown) => {
    if (shouldLog("debug")) console.debug(msg, meta ?? "");
  },
  info: (msg: string, meta?: unknown) => {
    if (shouldLog("info")) console.info(msg, meta ?? "");
  },
  warn: (msg: string, meta?: unknown) => {
    if (shouldLog("warn")) console.warn(msg, meta ?? "");
  },
  error: (msg: string, meta?: unknown) => {
    if (shouldLog("error")) console.error(msg, meta ?? "");
  },
};
