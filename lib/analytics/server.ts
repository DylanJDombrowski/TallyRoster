// lib/analytics/server.ts
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export interface AnalyticsData {
  totalPageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string; title: string; views: number }>;
  topTeams: Array<{ teamId: string; teamName: string; views: number }>;
  topPlayers: Array<{ playerId: string; playerName: string; views: number }>;
  viewsByDay: Array<{ date: string; views: number; uniqueVisitors: number }>;
  recentActivity: Array<{
    id: string;
    eventType: string;
    pagePath: string;
    pageTitle: string;
    createdAt: string;
    metadata: Record<string, unknown>;
  }>;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  eventType?: string;
  limit?: number;
}

// Helper function to safely access metadata properties
function getMetadataValue(
  metadata: Record<string, unknown>,
  key: string
): string | undefined {
  if (!metadata || typeof metadata !== "object") return undefined;
  return metadata[key] as string | undefined;
}

export async function getOrganizationAnalytics(
  organizationId: string,
  filters: AnalyticsFilters = {}
): Promise<AnalyticsData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    endDate = new Date().toISOString(),
    limit = 100,
  } = filters;

  // Base query conditions
  const baseQuery = supabase
    .from("analytics_events")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Get total page views
  const { count: totalPageViews } = await supabase
    .from("analytics_events")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .eq("event_type", "page_view")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  // Get unique visitors (distinct session IDs)
  const { data: uniqueVisitorsData } = await supabase
    .from("analytics_events")
    .select("session_id")
    .eq("organization_id", organizationId)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  const uniqueVisitors = new Set(
    uniqueVisitorsData?.map((row) => row.session_id).filter(Boolean) || []
  ).size;

  // Get top pages
  const { data: pageViewsData } = await baseQuery
    .eq("event_type", "page_view")
    .select("page_path, page_title");

  const pageViewCounts =
    pageViewsData?.reduce((acc, row) => {
      const key = row.page_path;
      acc[key] = acc[key] || {
        path: row.page_path,
        title: row.page_title || row.page_path,
        views: 0,
      };
      acc[key].views++;
      return acc;
    }, {} as Record<string, { path: string; title: string; views: number }>) ||
    {};

  const topPages = Object.values(pageViewCounts)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get top teams
  const { data: teamViewsData } = await baseQuery
    .eq("event_type", "team_view")
    .select("metadata");

  const teamViewCounts =
    teamViewsData?.reduce((acc, row) => {
      const metadataObj =
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : {};
      const teamId =
        getMetadataValue(metadataObj, "teamId") ||
        getMetadataValue(metadataObj, "team_id");
      const teamName =
        getMetadataValue(metadataObj, "teamName") ||
        getMetadataValue(metadataObj, "team_name");
      if (teamId) {
        acc[teamId] = acc[teamId] || {
          teamId,
          teamName: teamName || "Unknown Team",
          views: 0,
        };
        acc[teamId].views++;
      }
      return acc;
    }, {} as Record<string, { teamId: string; teamName: string; views: number }>) ||
    {};

  const topTeams = Object.values(teamViewCounts)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get top players
  const { data: playerViewsData } = await baseQuery
    .eq("event_type", "player_view")
    .select("metadata");

  const playerViewCounts =
    playerViewsData?.reduce((acc, row) => {
      const metadataObj =
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, unknown>)
          : {};
      const playerId =
        getMetadataValue(metadataObj, "playerId") ||
        getMetadataValue(metadataObj, "player_id");
      const playerName =
        getMetadataValue(metadataObj, "playerName") ||
        getMetadataValue(metadataObj, "player_name");
      if (playerId) {
        acc[playerId] = acc[playerId] || {
          playerId,
          playerName: playerName || "Unknown Player",
          views: 0,
        };
        acc[playerId].views++;
      }
      return acc;
    }, {} as Record<string, { playerId: string; playerName: string; views: number }>) ||
    {};

  const topPlayers = Object.values(playerViewCounts)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Get views by day
  const { data: dailyViewsData } = await baseQuery.select(
    "created_at, session_id"
  );

  const dailyStats =
    dailyViewsData?.reduce((acc, row) => {
      const date = new Date(row.created_at).toISOString().split("T")[0];
      acc[date] = acc[date] || { date, views: 0, sessions: new Set() };
      acc[date].views++;
      if (row.session_id) {
        acc[date].sessions.add(row.session_id);
      }
      return acc;
    }, {} as Record<string, { date: string; views: number; sessions: Set<string> }>) ||
    {};

  const viewsByDay = Object.values(dailyStats)
    .map(({ date, views, sessions }) => ({
      date,
      views,
      uniqueVisitors: sessions.size,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Get recent activity
  const { data: recentActivityData } = await baseQuery
    .select("id, event_type, page_path, page_title, created_at, metadata")
    .order("created_at", { ascending: false })
    .limit(limit);

  // Transform the recent activity data to match the expected interface
  const recentActivity =
    recentActivityData?.map((row) => ({
      id: row.id,
      eventType: row.event_type,
      pagePath: row.page_path,
      pageTitle: row.page_title || row.page_path,
      createdAt: row.created_at,
      metadata: (row.metadata as Record<string, unknown>) || {},
    })) || [];

  return {
    totalPageViews: totalPageViews || 0,
    uniqueVisitors,
    topPages,
    topTeams,
    topPlayers,
    viewsByDay,
    recentActivity,
  };
}

export async function getAnalyticsSummary(organizationId: string): Promise<{
  todayViews: number;
  weekViews: number;
  monthViews: number;
  totalViews: number;
}> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [todayResult, weekResult, monthResult, totalResult] = await Promise.all(
    [
      supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("event_type", "page_view")
        .gte("created_at", today),

      supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("event_type", "page_view")
        .gte("created_at", weekAgo),

      supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("event_type", "page_view")
        .gte("created_at", monthAgo),

      supabase
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", organizationId)
        .eq("event_type", "page_view"),
    ]
  );

  return {
    todayViews: todayResult.count || 0,
    weekViews: weekResult.count || 0,
    monthViews: monthResult.count || 0,
    totalViews: totalResult.count || 0,
  };
}
