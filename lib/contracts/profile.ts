import { z } from 'zod';

export const profileSchema = z.object({
  version: z.literal('1.0'),
  assessment_version_id: z.string(),
  scale: z.literal('LIKERT_7'),
  scores: z.object({
    big_five: z.object({
      O: z.number().min(0).max(100),
      C: z.number().min(0).max(100),
      E: z.number().min(0).max(100),
      A: z.number().min(0).max(100),
      N_emotional_stability: z.number().min(0).max(100)
    }),
    riasec: z.object({
      R: z.number().min(0).max(100),
      I: z.number().min(0).max(100),
      A: z.number().min(0).max(100),
      S: z.number().min(0).max(100),
      E: z.number().min(0).max(100),
      C: z.number().min(0).max(100)
    }),
    work_style: z.object({
      structure_preference: z.number(),
      social_energy: z.number(),
      change_appetite: z.number(),
      stress_reactivity: z.number()
    })
  }),
  confidence: z.object({
    score: z.number().min(0).max(100),
    band: z.enum(['High', 'Medium', 'Low']),
    signals: z.object({
      impression_penalty: z.number(),
      consistency_penalty: z.number(),
      behavior_penalty: z.number()
    })
  }),
  flags: z.array(z.string()),
  generated_at: z.string().datetime()
});

export type Profile = z.infer<typeof profileSchema>;
