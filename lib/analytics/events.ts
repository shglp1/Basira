export const analyticsEvents = [
  'signup_completed',
  'assessment_started',
  'assessment_completed',
  'report_viewed',
  'pdf_requested',
  'share_card_generated',
  'job_recommendation_clicked'
] as const;

export type AnalyticsEvent = (typeof analyticsEvents)[number];

export type AssessmentCompletedProps = {
  confidence_band: 'High' | 'Medium' | 'Low';
  completion_time: number;
};
