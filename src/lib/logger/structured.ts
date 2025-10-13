type LogLevel = "info" | "warn" | "error";

type BaseLogPayload = {
  uid?: string;
  path: string;
  status: number;
  mode: string;
  route: string;
  reason?: string;
};

export function logStructured(
  level: LogLevel,
  payload: BaseLogPayload,
): void {
  const entry = {
    severity: mapLevelToSeverity(level),
    timestamp: new Date().toISOString(),
    ...payload,
  };
  console[level === "error" ? "error" : level](JSON.stringify(entry));
}

function mapLevelToSeverity(level: LogLevel): string {
  switch (level) {
    case "info":
      return "INFO";
    case "warn":
      return "WARNING";
    case "error":
      return "ERROR";
    default:
      return "DEFAULT";
  }
}
