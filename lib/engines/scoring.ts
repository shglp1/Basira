export type ConfidenceSignals = {
  impressionPenalty: number;
  consistencyPenalty: number;
  behaviorPenalty: number;
};

export function reverseScore(value: number): number {
  if (value < 1 || value > 7) throw new Error('LIKERT_7 value must be between 1 and 7');
  return 8 - value;
}

export function calculateConfidence(signals: ConfidenceSignals): number {
  const initial =
    100 -
    (0.4 * signals.impressionPenalty +
      0.4 * signals.consistencyPenalty +
      0.2 * signals.behaviorPenalty);
  return Math.max(0, Math.min(100, Math.round(initial)));
}

export function calculateConfidenceBand(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 75) return 'High';
  if (score >= 50) return 'Medium';
  return 'Low';
}

export function speedingPenalty(speedingRate: number, minResponseTimeMs = 1200): number {
  if (minResponseTimeMs !== 1200) throw new Error('V1 contract pins min_response_time_ms to 1200');
  return speedingRate >= 0.35 ? 25 : 0;
}

export function repetitiveAnswerPenalty(maxRepeated: number, dominantOptionRate: number): number {
  if (maxRepeated >= 12 || dominantOptionRate >= 0.6) return 30;
  return 0;
}
