// lib/analytics/tracker.ts
import { createClient } from "@/lib/supabase/client";

export type AnalyticsEventType = 
  | 'page_view'
  | 'team_view'
  | 'player_view'
  | 'blog_view'
  | 'schedule_view'
  | 'contact_view'
  | 'navigation_click'
  | 'search'
  | 'download';

export interface AnalyticsEvent {
  organizationId: string;
  eventType: AnalyticsEventType;
  pagePath: string;
  pageTitle?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

class AnalyticsTracker {
  private supabase = createClient();
  private sessionId: string;

  constructor() {
    // Generate a session ID for this browser session
    this.sessionId = this.getOrCreateSessionId();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Track an analytics event
   */
  async track(event: AnalyticsEvent): Promise<void> {
    try {
      const { data: user } = await this.supabase.auth.getUser();
      
      const analyticsData = {
        organization_id: event.organizationId,
        event_type: event.eventType,
        page_path: event.pagePath,
        page_title: event.pageTitle || document.title,
        user_id: user.user?.id || null,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        metadata: event.metadata || null,
      };

      const { error } = await this.supabase
        .from('analytics_events')
        .insert(analyticsData);

      if (error) {
        console.warn('Analytics tracking failed:', error);
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error);
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(organizationId: string, pagePath: string, pageTitle?: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.track({
      organizationId,
      eventType: 'page_view',
      pagePath,
      pageTitle,
      metadata,
    });
  }

  /**
   * Track a team view
   */
  async trackTeamView(organizationId: string, teamId: string, teamName: string): Promise<void> {
    await this.track({
      organizationId,
      eventType: 'team_view',
      pagePath: window.location.pathname,
      metadata: { teamId, teamName },
    });
  }

  /**
   * Track a player view
   */
  async trackPlayerView(organizationId: string, playerId: string, playerName: string): Promise<void> {
    await this.track({
      organizationId,
      eventType: 'player_view',
      pagePath: window.location.pathname,
      metadata: { playerId, playerName },
    });
  }

  /**
   * Track a blog post view
   */
  async trackBlogView(organizationId: string, blogId: string, blogTitle: string): Promise<void> {
    await this.track({
      organizationId,
      eventType: 'blog_view',
      pagePath: window.location.pathname,
      metadata: { blogId, blogTitle },
    });
  }
}

// Export a singleton instance
export const analytics = new AnalyticsTracker();

// Utility function to get organization ID from current subdomain or context
export function getOrganizationIdFromContext(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Extract subdomain from current hostname
  const hostname = window.location.hostname;
  
  // In development, we might be on localhost, so check for organization in path or other means
  if (hostname === 'localhost' || hostname.includes('localhost')) {
    // For development, you might need to get org ID from path or store it differently
    return sessionStorage.getItem('current_organization_id');
  }
  
  // For production subdomains, you'd need to map subdomain to organization ID
  // This could be done via an API call or stored in localStorage/sessionStorage
  return sessionStorage.getItem('current_organization_id');
}