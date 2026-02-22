import { describe, expect, it } from 'vitest';
import { adjustedScore, baseScoreFromVectors } from '@/lib/engines/matching';
import {
  calculateConfidence,
  calculateConfidenceBand,
  repetitiveAnswerPenalty,
  reverseScore,
  speedingPenalty
} from '@/lib/engines/scoring';
import { profileSchema } from '@/lib/contracts/profile';
import { __testables__ } from '@/lib/services/assessment';

describe('scoring rules', () => {
  it('implements reverse scoring BR-1', () => {
    expect(reverseScore(1)).toBe(7);
    expect(reverseScore(7)).toBe(1);
  });

  it('computes confidence and bands BR-3', () => {
    const score = calculateConfidence({ impressionPenalty: 20, consistencyPenalty: 35, behaviorPenalty: 15 });
    expect(score).toBe(75);
    expect(calculateConfidenceBand(score)).toBe('High');
  });

  it('applies behavior penalties', () => {
    expect(speedingPenalty(0.4)).toBe(25);
    expect(repetitiveAnswerPenalty(12, 0.2)).toBe(30);
  });

  it('documents V1 placeholder validity signals (IM/CONS)', () => {
    const score = calculateConfidence({ impressionPenalty: 0, consistencyPenalty: 0, behaviorPenalty: 0 });
    expect(score).toBe(100);
  });
});

describe('matching rules', () => {
  it('generates bounded base score BR-4', () => {
    const score = baseScoreFromVectors([1, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0]);
    expect(score).toBe(100);
  });

  it('caps penalties and stress adjustment BR-5', () => {
    const score = adjustedScore(90, [-50], 25, 'High');
    expect(score).toBe(60);
  });
});

describe('assessment service mapping', () => {
  it('separates Big Five vs RIASEC buckets (no key collision)', () => {
    const buckets = __testables__.buildTraitBuckets([
      { value: 7, items: { trait_key: 'BF_C', reverse_scored: false } },
      { value: 1, items: { trait_key: 'RI_C', reverse_scored: false } }
    ] as any[]);

    expect(buckets.BF_C).toEqual([7]);
    expect(buckets.RI_C).toEqual([1]);
  });
});

describe('profile contract', () => {
  it('validates appendix A payload shape', () => {
    const parsed = profileSchema.safeParse({
      version: '1.0',
      assessment_version_id: 'v2026_02_pro_01',
      scale: 'LIKERT_7',
      scores: {
        big_five: { O: 72, C: 81, E: 44, A: 63, N_emotional_stability: 28 },
        riasec: { R: 22, I: 78, A: 55, S: 41, E: 33, C: 18 },
        work_style: { structure_preference: 84, social_energy: 40, change_appetite: 70, stress_reactivity: 72 }
      },
      confidence: {
        score: 62,
        band: 'Medium',
        signals: { impression_penalty: 20, consistency_penalty: 35, behavior_penalty: 15 }
      },
      flags: ['LOW_STABILITY_WARNING'],
      generated_at: '2026-02-22T10:00:00Z'
    });

    expect(parsed.success).toBe(true);
  });
});
