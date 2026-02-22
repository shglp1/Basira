export type RIASECVector = [number, number, number, number, number, number];

const dot = (a: number[], b: number[]) => a.reduce((sum, x, i) => sum + x * b[i], 0);
const norm = (a: number[]) => Math.sqrt(dot(a, a));

export function cosineSimilarity(a: RIASECVector, b: RIASECVector): number {
  const denominator = norm(a) * norm(b);
  if (!denominator) return 0;
  return Math.max(0, dot(a, b) / denominator);
}

export function baseScoreFromVectors(user: RIASECVector, occupation: RIASECVector): number {
  return Math.round(Math.max(0, Math.min(1, cosineSimilarity(user, occupation))) * 100);
}

export function adjustedScore(
  baseScore: number,
  adjustments: number[],
  emotionalStability: number,
  stressLevel: 'Low' | 'Medium' | 'High'
): number {
  const stressPenalty = emotionalStability <= 30 && stressLevel === 'High' ? -20 : 0;
  const manual = adjustments.reduce((sum, x) => sum + x, 0);
  const totalPenalty = Math.max(-30, Math.min(0, manual + stressPenalty));
  const adjusted = baseScore + totalPenalty;
  return Math.max(0, Math.min(100, Math.round(adjusted)));
}
