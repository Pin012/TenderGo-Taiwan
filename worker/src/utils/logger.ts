export function logInfo(runId: string, message: string, extra?: unknown): void {
  console.log(JSON.stringify({ level: 'info', runId, message, extra }));
}

export function logError(runId: string, message: string, extra?: unknown): void {
  console.error(JSON.stringify({ level: 'error', runId, message, extra }));
}
