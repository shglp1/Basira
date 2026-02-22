import type { AnalyticsEvent, AssessmentCompletedProps } from './events';

export function trackEvent(event: AnalyticsEvent, payload?: Record<string, unknown> | AssessmentCompletedProps) {
  console.info('[analytics]', event, payload ?? {});
}
