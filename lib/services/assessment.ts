import { profileSchema } from '@/lib/contracts/profile';
import { adjustedScore, baseScoreFromVectors, type RIASECVector } from '@/lib/engines/matching';
import { calculateConfidence, calculateConfidenceBand, repetitiveAnswerPenalty, speedingPenalty } from '@/lib/engines/scoring';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

const ACTIVE_VERSION = process.env.BASEERA_ACTIVE_VERSION_ID ?? 'v2026_02_pro_01';

const BUCKET_KEYS = [
  'BF_O',
  'BF_C',
  'BF_E',
  'BF_A',
  'BF_N',
  'RI_R',
  'RI_I',
  'RI_A',
  'RI_S',
  'RI_E',
  'RI_C'
] as const;

type BucketKey = (typeof BUCKET_KEYS)[number];

function toLikert100(avgLikert: number): number {
  return Math.round(((avgLikert - 1) / 6) * 100);
}

function avg(values: number[]): number {
  if (!values.length) return 4;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildTraitBuckets(rows: any[]) {
  const traitBuckets: Record<BucketKey, number[]> = {
    BF_O: [],
    BF_C: [],
    BF_E: [],
    BF_A: [],
    BF_N: [],
    RI_R: [],
    RI_I: [],
    RI_A: [],
    RI_S: [],
    RI_E: [],
    RI_C: []
  };

  for (const row of rows) {
    const item = row.items;
    const original = Number(row.value);
    const normalized = item.reverse_scored ? 8 - original : original;
    const key = String(item.trait_key) as BucketKey;
    if (key in traitBuckets) traitBuckets[key].push(normalized);
  }

  return traitBuckets;
}

export async function startAssessment(userId: string) {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from('assessments')
    .insert({ user_id: userId, version_id: ACTIVE_VERSION, status: 'started' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function processAssessment(assessmentId: string, userId: string) {
  const supabase = createSupabaseServiceClient();

  const { data: assessment } = await supabase
    .from('assessments')
    .select('id,user_id,status')
    .eq('id', assessmentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!assessment) throw new Error('Assessment not found for user');
  if (assessment.status === 'completed') return;

  const { data: rows, error: responseErr } = await supabase
    .from('responses')
    .select('value,response_time_ms,items!inner(trait_key,reverse_scored),item_id')
    .eq('assessment_id', assessmentId);

  if (responseErr) throw responseErr;
  if (!rows || rows.length === 0) throw new Error('No responses to process');

  const traitBuckets = buildTraitBuckets(rows as any[]);

  const bfO = toLikert100(avg(traitBuckets.BF_O));
  const bfC = toLikert100(avg(traitBuckets.BF_C));
  const bfE = toLikert100(avg(traitBuckets.BF_E));
  const bfA = toLikert100(avg(traitBuckets.BF_A));
  const bfN = toLikert100(avg(traitBuckets.BF_N));

  const riR = toLikert100(avg(traitBuckets.RI_R));
  const riI = toLikert100(avg(traitBuckets.RI_I));
  const riA = toLikert100(avg(traitBuckets.RI_A));
  const riS = toLikert100(avg(traitBuckets.RI_S));
  const riE = toLikert100(avg(traitBuckets.RI_E));
  const riC = toLikert100(avg(traitBuckets.RI_C));

  const speedingRate = rows.filter((r: any) => Number(r.response_time_ms) < 1200).length / rows.length;
  const optionCounts = rows.reduce<Record<string, number>>((acc: Record<string, number>, r: any) => {
    const key = String(r.value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const maxRepeated = Math.max(...Object.values(optionCounts));
  const dominantOptionRate = maxRepeated / rows.length;

  const behaviorPenalty = speedingPenalty(speedingRate) + repetitiveAnswerPenalty(maxRepeated, dominantOptionRate);
  // TODO(v1): Implement Impression Management penalty from dedicated validity items/signals.
  const impressionPenalty = 0;
  // TODO(v1): Implement consistency penalty using contradictory item pairs / inconsistency checks.
  const consistencyPenalty = 0;

  const confidence = calculateConfidence({ impressionPenalty, consistencyPenalty, behaviorPenalty });
  const confidenceBand = calculateConfidenceBand(confidence);

  const profile = profileSchema.parse({
    version: '1.0',
    assessment_version_id: ACTIVE_VERSION,
    scale: 'LIKERT_7',
    scores: {
      big_five: { O: bfO, C: bfC, E: bfE, A: bfA, N_emotional_stability: bfN },
      riasec: { R: riR, I: riI, A: riA, S: riS, E: riE, C: riC },
      work_style: {
        structure_preference: bfC,
        social_energy: bfE,
        change_appetite: bfO,
        stress_reactivity: 100 - bfN
      }
    },
    confidence: {
      score: confidence,
      band: confidenceBand,
      signals: {
        impression_penalty: impressionPenalty,
        consistency_penalty: consistencyPenalty,
        behavior_penalty: behaviorPenalty
      }
    },
    flags: bfN <= 30 ? ['LOW_STABILITY_WARNING'] : [],
    generated_at: new Date().toISOString()
  });

  await supabase.from('scores').upsert(
    {
      assessment_id: assessmentId,
      bf_o: bfO,
      bf_c: bfC,
      bf_e: bfE,
      bf_a: bfA,
      bf_n: bfN,
      ri_r: riR,
      ri_i: riI,
      ri_a: riA,
      ri_s: riS,
      ri_e: riE,
      ri_c: riC,
      confidence_score: confidence,
      confidence_band: confidenceBand,
      profile_json: profile
    },
    { onConflict: 'assessment_id' }
  );

  const userVector: RIASECVector = [riR, riI, riA, riS, riE, riC];
  const { data: occupations, error: occErr } = await supabase.from('occupations').select('*');
  if (occErr) throw occErr;

  const matches = (occupations ?? [])
    .map((job: any) => {
      const occVector = (job.riasec_vector as number[]).slice(0, 6) as RIASECVector;
      const base = baseScoreFromVectors(userVector, occVector);
      const adjusted = adjustedScore(base, [], bfN, job.stress_level);
      const reasons = [
        'توافق قوي في متجه RIASEC',
        bfC >= 75 ? 'مستوى التنظيم لديك يدعم متطلبات الدور' : 'مرونة أسلوب العمل متوافقة مع الدور',
        bfO >= 80 ? 'النزعة الابتكارية تدعم هذا المسار' : 'متطلبات الدور مناسبة لنمطك المهني'
      ];
      return {
        assessment_id: assessmentId,
        occupation_id: job.id,
        similarity_score: base,
        adjusted_score: adjusted,
        reasons_json: reasons
      };
    })
    .sort((a, b) => b.adjusted_score - a.adjusted_score)
    .slice(0, 10);

  if (matches.length) {
    await supabase.from('matches').delete().eq('assessment_id', assessmentId);
    await supabase.from('matches').insert(matches);
  }

  await supabase
    .from('assessments')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', assessmentId)
    .eq('user_id', userId);
}

export const __testables__ = { buildTraitBuckets };
