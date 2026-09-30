export class MissingToolCallsError extends Error {
  readonly missing: Array<string>;

  constructor(missing: Array<string>) {
    super(`Required tool calls were not made: ${missing.join(', ')}`);
    this.name = 'MissingToolCallsError';
    this.missing = missing;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readToolName(chunk: unknown): string | undefined {
  if (!isRecord(chunk)) {
    return undefined;
  }

  if (typeof chunk.toolName === 'string') {
    return chunk.toolName;
  }

  if (isRecord(chunk.payload) && typeof chunk.payload.toolName === 'string') {
    return chunk.payload.toolName;
  }

  return undefined;
}

function readToolResult(chunk: unknown): unknown {
  if (!isRecord(chunk)) {
    return undefined;
  }

  if ('result' in chunk) {
    return chunk.result;
  }

  if (!isRecord(chunk.payload)) {
    return undefined;
  }

  if ('result' in chunk.payload) {
    return chunk.payload.result;
  }

  if ('output' in chunk.payload) {
    return chunk.payload.output;
  }

  return undefined;
}

export interface ToolRunTrace {
  toolCalls?: Array<unknown>;
  toolResults?: Array<unknown>;
  steps?: Array<{
    toolCalls?: Array<unknown>;
    toolResults?: Array<unknown>;
  }>;
}

function collectChunks(
  trace: ToolRunTrace,
  key: 'toolCalls' | 'toolResults'
): Array<unknown> {
  return [
    ...(trace[key] ?? []),
    ...(trace.steps ?? []).flatMap((step) => step[key] ?? []),
  ];
}

export function collectCalledToolIds(trace: ToolRunTrace): Set<string> {
  const ids = new Set<string>();

  for (const chunk of [
    ...collectChunks(trace, 'toolCalls'),
    ...collectChunks(trace, 'toolResults'),
  ]) {
    const name = readToolName(chunk);
    if (name) {
      ids.add(name);
    }
  }

  return ids;
}

export function collectToolResults(trace: ToolRunTrace): Map<string, unknown> {
  const results = new Map<string, unknown>();

  for (const chunk of collectChunks(trace, 'toolResults')) {
    const name = readToolName(chunk);
    if (!name) {
      continue;
    }

    results.set(name, readToolResult(chunk));
  }

  return results;
}

export function assertRequiredToolCalls(
  trace: ToolRunTrace,
  required: Array<string>
): Map<string, unknown> {
  const called = collectCalledToolIds(trace);
  const missing = required.filter((id) => !called.has(id));

  if (missing.length > 0) {
    throw new MissingToolCallsError(missing);
  }

  return collectToolResults(trace);
}

export function requireToolResult(
  results: Map<string, unknown>,
  toolId: string
): unknown {
  if (!results.has(toolId)) {
    throw new MissingToolCallsError([toolId]);
  }

  return results.get(toolId);
}
