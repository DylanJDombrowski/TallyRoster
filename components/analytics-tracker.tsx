"use client";

import { useEffect } from "react";
import { analytics } from "@/lib/analytics/tracker";

interface AnalyticsTrackerProps {
  organizationId: string;
  eventType?: 'page_view' | 'team_view' | 'player_view' | 'blog_view';
  metadata?: Record<string, unknown>;
}

export function AnalyticsTracker({ organizationId, eventType = 'page_view', metadata }: AnalyticsTrackerProps) {
  useEffect(() => {
    if (organizationId) {
      analytics.track({
        organizationId,
        eventType,
        pagePath: window.location.pathname,
        pageTitle: document.title,
        metadata,
      });
    }
  }, [organizationId, eventType, metadata]);

  return null; // This component doesn't render anything
}