"use client";

import { AnalyticsData } from "@/lib/analytics/server";
import { Eye, TrendingUp, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface AnalyticsDashboardProps {
  analyticsData: AnalyticsData;
  analyticsSummary: {
    todayViews: number;
    weekViews: number;
    monthViews: number;
    totalViews: number;
  };
}

export function AnalyticsDashboard({ analyticsData, analyticsSummary }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard
          title="Total Views"
          value={analyticsSummary.totalViews}
          icon={<Eye className="w-6 h-6" />}
          description="All time page views"
        />
        <SummaryCard
          title="Monthly Views"
          value={analyticsSummary.monthViews}
          icon={<TrendingUp className="w-6 h-6" />}
          description="Last 30 days"
        />
        <SummaryCard
          title="Weekly Views"
          value={analyticsSummary.weekViews}
          icon={<Calendar className="w-6 h-6" />}
          description="Last 7 days"
        />
        <SummaryCard
          title="Today's Views"
          value={analyticsSummary.todayViews}
          icon={<Clock className="w-6 h-6" />}
          description="Today"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Pages</h3>
          <div className="space-y-3">
            {analyticsData.topPages.slice(0, 5).map((page) => (
              <div key={page.path} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {page.title || page.path}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{page.path}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{page.views}</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Teams */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Teams</h3>
          <div className="space-y-3">
            {analyticsData.topTeams.slice(0, 5).map((team) => (
              <div key={team.teamId} className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {team.teamName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{team.views}</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              </div>
            ))}
            {analyticsData.topTeams.length === 0 && (
              <p className="text-sm text-slate-500">No team views yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Views by Day Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Views Over Time</h3>
        <div className="h-64 flex items-end space-x-2">
          {analyticsData.viewsByDay.slice(-14).map((day) => {
            const maxViews = Math.max(...analyticsData.viewsByDay.map(d => d.views));
            const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0;
            
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t w-full min-h-1"
                  style={{ height: `${height}%` }}
                  title={`${day.views} views on ${format(new Date(day.date), 'MMM d')}`}
                ></div>
                <span className="text-xs text-slate-500 mt-2 transform -rotate-45 origin-center">
                  {format(new Date(day.date), 'M/d')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {analyticsData.recentActivity.slice(0, 10).map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">
                  {activity.eventType === 'page_view' && 'Page viewed: '}
                  {activity.eventType === 'team_view' && 'Team viewed: '}
                  {activity.eventType === 'player_view' && 'Player viewed: '}
                  {activity.eventType === 'blog_view' && 'Blog post viewed: '}
                  <span className="font-medium">
                    {activity.pageTitle || activity.pagePath}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))}
          {analyticsData.recentActivity.length === 0 && (
            <p className="text-sm text-slate-500">No recent activity</p>
          )}
        </div>
      </div>

      {/* Top Players */}
      {analyticsData.topPlayers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Players</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData.topPlayers.slice(0, 6).map((player) => (
              <div key={player.playerId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {player.playerName}
                  </p>
                </div>
                <span className="text-sm text-slate-600">{player.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}

function SummaryCard({ title, value, icon, description }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        <div className="text-blue-500">{icon}</div>
      </div>
    </div>
  );
}