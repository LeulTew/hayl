/**
 * Analytics event contract and emitter for the Hayl platform.
 *
 * Currently a no-op safe logger. In production, this can be swapped
 * for a Convex mutation sink, PostHog, or any analytics backend.
 *
 * @module analytics
 */

// ──────────────────────────────────────────────
// Event Types
// ──────────────────────────────────────────────

interface HomeKpiImpressionPayload {
  /** Which KPI cards were visible on mount */
  visibleCards: string[];
  /** The progress classification shown */
  progressClassification: string;
}

interface HomeCtaClickPayload {
  /** Identifier of the CTA that was clicked */
  ctaId: 'start_session' | 'view_profile' | 'view_nutrition' | 'view_workouts' | 'log_weight';
  /** Optional destination view */
  destination?: string;
}

interface DrillDownNavigationPayload {
  /** Source card the user drilled down from */
  sourceCard: string;
  /** Target view navigated to */
  targetView: string;
}

type AnalyticsEventMap = {
  home_kpi_impression: HomeKpiImpressionPayload;
  home_cta_click: HomeCtaClickPayload;
  drill_down_navigation: DrillDownNavigationPayload;
};

type AnalyticsEventName = keyof AnalyticsEventMap;

interface AnalyticsEnvelope<T extends AnalyticsEventName> {
  event: T;
  properties: AnalyticsEventMap[T];
  timestamp: number;
}

// ──────────────────────────────────────────────
// Emitter
// ──────────────────────────────────────────────

const IS_DEV = typeof import.meta !== 'undefined'
  && typeof import.meta.env !== 'undefined'
  && import.meta.env.DEV === true;

/**
 * Tracks an analytics event with a typed payload.
 * In development, logs to console. In production, no-ops (ready for future sink).
 *
 * @param eventName - The event name from the AnalyticsEventMap
 * @param properties - Typed payload matching the event
 */
export function trackEvent<T extends AnalyticsEventName>(
  eventName: T,
  properties: AnalyticsEventMap[T],
): void {
  const envelope: AnalyticsEnvelope<T> = {
    event: eventName,
    properties,
    timestamp: Date.now(),
  };

  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.info('[Analytics]', envelope.event, envelope.properties);
  }

  // Future: send to Convex mutation or external sink
  // void ctx.runMutation(api.analytics.ingest, envelope);
}
