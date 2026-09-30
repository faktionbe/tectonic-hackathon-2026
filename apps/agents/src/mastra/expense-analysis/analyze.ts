import {
  type AnalysisPeriod,
  analysisPeriodSchema,
  type Evidence,
  evidenceSchema,
  type ExpenseAnalysisResult,
  expenseAnalysisResultSchema,
  USE_CASE_LABELS,
  type UseCaseLabel,
  type UseCaseResult,
  useCaseStatusSchema,
} from '../schemas/expense-analysis';

const INSUFFICIENT_SUMMARY =
  'Not enough transaction evidence to determine this pattern.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function insufficientUseCase(label: UseCaseLabel): UseCaseResult {
  return {
    label,
    status: 'insufficient_data',
    confidence: 0,
    summary: INSUFFICIENT_SUMMARY,
    evidence: [],
  };
}

function readPeriod(raw: unknown, fallback: AnalysisPeriod): AnalysisPeriod {
  if (!isRecord(raw)) {
    return fallback;
  }

  const parsed = analysisPeriodSchema.safeParse(raw.period);
  return parsed.success ? parsed.data : fallback;
}

function readUseCaseEntries(raw: unknown): Map<string, unknown> {
  const entries = new Map<string, unknown>();
  if (!isRecord(raw)) {
    return entries;
  }

  if (Array.isArray(raw.useCases)) {
    for (const item of raw.useCases) {
      if (!isRecord(item) || typeof item.label !== 'string') {
        continue;
      }
      entries.set(item.label, item);
    }
    return entries;
  }

  if (isRecord(raw.useCases)) {
    for (const [label, value] of Object.entries(raw.useCases)) {
      entries.set(label, value);
    }
  }

  return entries;
}

function keepKnownEvidence(
  value: unknown,
  knownExpenseIds: ReadonlySet<string>
): Array<Evidence> {
  if (!Array.isArray(value)) {
    return [];
  }

  const kept: Array<Evidence> = [];
  for (const item of value) {
    const parsed = evidenceSchema.safeParse(item);
    if (!parsed.success) {
      continue;
    }

    const transactionIds = parsed.data.transactionIds.filter((id) =>
      knownExpenseIds.has(id)
    );
    if (transactionIds.length === 0) {
      continue;
    }

    kept.push({
      transactionIds,
      explanation: parsed.data.explanation,
    });
  }

  return kept;
}

function repairOne(
  label: UseCaseLabel,
  value: unknown,
  knownExpenseIds: ReadonlySet<string>
): UseCaseResult {
  if (!isRecord(value)) {
    return insufficientUseCase(label);
  }

  const status = useCaseStatusSchema.safeParse(value.status);
  const confidence = zConfidence(value.confidence);
  const summary =
    typeof value.summary === 'string' && value.summary.length > 0
      ? value.summary
      : undefined;

  if (!status.success || confidence === undefined || summary === undefined) {
    return insufficientUseCase(label);
  }

  const evidence = keepKnownEvidence(value.evidence, knownExpenseIds);
  if (status.data === 'detected' && evidence.length === 0) {
    return insufficientUseCase(label);
  }

  return {
    label,
    status: status.data,
    confidence,
    summary,
    evidence,
  };
}

function zConfidence(value: unknown): number | undefined {
  if (typeof value !== 'number' || value < 0 || value > 1) {
    return undefined;
  }

  return value;
}

export function repairExpenseAnalysis(
  raw: unknown,
  fallbackPeriod: AnalysisPeriod,
  knownExpenseIds: ReadonlySet<string>
): ExpenseAnalysisResult {
  const entries = readUseCaseEntries(raw);
  const useCases = USE_CASE_LABELS.map((label) =>
    repairOne(label, entries.get(label), knownExpenseIds)
  );

  return expenseAnalysisResultSchema.parse({
    period: readPeriod(raw, fallbackPeriod),
    useCases,
  });
}
