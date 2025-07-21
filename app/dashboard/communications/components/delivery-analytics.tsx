// app/dashboard/communications/components/delivery-analytics.tsx
"use client";

import {
  TrendingUp,
  Mail,
  MessageCircle,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

interface Communication {
  id: string;
  subject: string;
  message_type: string | null;
  priority: string | null;
  created_at: string;
  sent_at: string | null;
  communication_deliveries: {
    status: string | null;
    delivery_channel: string;
    sent_at: string | null;
    delivered_at: string | null;
  }[];
}

interface DeliveryAnalyticsProps {
  communications: Communication[];
}

export function DeliveryAnalytics({ communications }: DeliveryAnalyticsProps) {
  // Calculate analytics from communications data
  const analytics = calculateAnalytics(communications);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Delivery Analytics
        </h2>
        <p className="text-gray-600 mt-1">
          Track the performance of your team communications
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Messages"
          value={analytics.totalMessages}
          icon={Mail}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="Delivery Rate"
          value={`${analytics.deliveryRate}%`}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
          trend={analytics.deliveryTrend}
        />
        <MetricCard
          title="Avg. Delivery Time"
          value={analytics.avgDeliveryTime}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <MetricCard
          title="Failed Messages"
          value={analytics.failedMessages}
          icon={AlertCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Status Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Delivery Status
            </h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <DeliveryStatusChart data={analytics.statusBreakdown} />
        </div>

        {/* Message Types Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Message Types
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <MessageTypesChart data={analytics.messageTypes} />
        </div>
      </div>

      {/* Delivery Channels */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Delivery Channels
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ChannelStats
            title="Email"
            icon={Mail}
            stats={analytics.channels.email}
            color="text-blue-600"
          />
          <ChannelStats
            title="SMS"
            icon={MessageCircle}
            stats={analytics.channels.sms}
            color="text-green-600"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <RecentActivity communications={communications.slice(0, 5)} />
      </div>
    </div>
  );
}

// Helper function to calculate analytics
function calculateAnalytics(communications: Communication[]): {
  totalMessages: number;
  deliveryRate: number;
  deliveryTrend: "up" | "stable" | "down";
  avgDeliveryTime: string;
  failedMessages: number;
  statusBreakdown: { delivered: number; pending: number; failed: number };
  messageTypes: Record<string, number>;
  channels: {
    email: { total: number; delivered: number; failed: number; rate: number };
    sms: { total: number; delivered: number; failed: number; rate: number };
  };
} {
  const totalMessages = communications.length;
  const totalDeliveries = communications.flatMap(
    (c) => c.communication_deliveries
  );

  const delivered = totalDeliveries.filter(
    (d) => d.status === "delivered" || d.status === "sent"
  ).length;
  const failed = totalDeliveries.filter((d) => d.status === "failed").length;
  const pending = totalDeliveries.filter((d) => d.status === "pending").length;

  const deliveryRate =
    totalDeliveries.length > 0
      ? Math.round((delivered / totalDeliveries.length) * 100)
      : 0;

  // Calculate average delivery time
  const deliveredWithTimes = totalDeliveries.filter(
    (d) =>
      (d.status === "delivered" || d.status === "sent") &&
      d.sent_at &&
      d.delivered_at
  );

  const avgDeliveryTime =
    deliveredWithTimes.length > 0
      ? Math.round(
          deliveredWithTimes.reduce((acc, d) => {
            const sent = new Date(d.sent_at!).getTime();
            const delivered = new Date(d.delivered_at!).getTime();
            return acc + (delivered - sent);
          }, 0) /
            deliveredWithTimes.length /
            1000
        ) // Convert to seconds
      : 0;

  const formatDeliveryTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  // Message types breakdown
  const messageTypes = communications.reduce((acc, comm) => {
    const type = comm.message_type || "announcement";
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Channel breakdown
  const emailDeliveries = totalDeliveries.filter(
    (d) => d.delivery_channel === "email"
  );
  const smsDeliveries = totalDeliveries.filter(
    (d) => d.delivery_channel === "sms"
  );

  return {
    totalMessages,
    deliveryRate,
    deliveryTrend:
      deliveryRate > 90 ? "up" : deliveryRate > 70 ? "stable" : "down",
    avgDeliveryTime: formatDeliveryTime(avgDeliveryTime),
    failedMessages: failed,
    statusBreakdown: {
      delivered,
      pending,
      failed,
    },
    messageTypes,
    channels: {
      email: {
        total: emailDeliveries.length,
        delivered: emailDeliveries.filter(
          (d) => d.status === "delivered" || d.status === "sent"
        ).length,
        failed: emailDeliveries.filter((d) => d.status === "failed").length,
        rate:
          emailDeliveries.length > 0
            ? Math.round(
                (emailDeliveries.filter(
                  (d) => d.status === "delivered" || d.status === "sent"
                ).length /
                  emailDeliveries.length) *
                  100
              )
            : 0,
      },
      sms: {
        total: smsDeliveries.length,
        delivered: smsDeliveries.filter(
          (d) => d.status === "delivered" || d.status === "sent"
        ).length,
        failed: smsDeliveries.filter((d) => d.status === "failed").length,
        rate:
          smsDeliveries.length > 0
            ? Math.round(
                (smsDeliveries.filter(
                  (d) => d.status === "delivered" || d.status === "sent"
                ).length /
                  smsDeliveries.length) *
                  100
              )
            : 0,
      },
    },
  };
}

// Metric Card Component
function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  trend?: "up" | "down" | "stable";
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          <TrendingUp
            className={`w-4 h-4 mr-1 ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {trend === "up"
              ? "Good delivery rate"
              : trend === "down"
              ? "Needs improvement"
              : "Stable"}
          </span>
        </div>
      )}
    </div>
  );
}

// Delivery Status Chart Component (Simple visualization)
function DeliveryStatusChart({
  data,
}: {
  data: { delivered: number; pending: number; failed: number };
}) {
  const total = data.delivered + data.pending + data.failed;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No delivery data available
      </div>
    );
  }

  const deliveredPercent = (data.delivered / total) * 100;
  const pendingPercent = (data.pending / total) * 100;
  const failedPercent = (data.failed / total) * 100;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Delivered</span>
          </div>
          <span className="text-sm font-medium">
            {data.delivered} ({Math.round(deliveredPercent)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${deliveredPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Pending</span>
          </div>
          <span className="text-sm font-medium">
            {data.pending} ({Math.round(pendingPercent)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-yellow-500 h-2 rounded-full"
            style={{ width: `${pendingPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <span className="text-sm font-medium">
            {data.failed} ({Math.round(failedPercent)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-500 h-2 rounded-full"
            style={{ width: `${failedPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Message Types Chart Component
function MessageTypesChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No message data available
      </div>
    );
  }

  const colors = {
    announcement: "bg-blue-500",
    reminder: "bg-yellow-500",
    emergency: "bg-red-500",
    update: "bg-green-500",
  };

  return (
    <div className="space-y-3">
      {entries.map(([type, count]) => {
        const percentage = (count / total) * 100;
        return (
          <div key={type} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-2 ${
                    colors[type as keyof typeof colors] || "bg-gray-500"
                  }`}
                />
                <span className="text-sm text-gray-600 capitalize">{type}</span>
              </div>
              <span className="text-sm font-medium">
                {count} ({Math.round(percentage)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  colors[type as keyof typeof colors] || "bg-gray-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Channel Stats Component
function ChannelStats({
  title,
  icon: Icon,
  stats,
  color,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  stats: { total: number; delivered: number; failed: number; rate: number };
  color: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Icon className={`w-5 h-5 mr-2 ${color}`} />
        <h4 className="font-medium text-gray-900">{title}</h4>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.delivered}
          </div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          <div className="text-sm text-gray-600">Failed</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Success Rate</span>
          <span
            className={`text-sm font-medium ${
              stats.rate > 90
                ? "text-green-600"
                : stats.rate > 70
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {stats.rate}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              stats.rate > 90
                ? "bg-green-500"
                : stats.rate > 70
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${stats.rate}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Recent Activity Component
function RecentActivity({
  communications,
}: {
  communications: Communication[];
}) {
  if (communications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No recent activity</div>
    );
  }

  const getStatusIcon = (communication: Communication) => {
    const deliveries = communication.communication_deliveries;
    const hasDelivered = deliveries.some(
      (d) => d.status === "delivered" || d.status === "sent"
    );
    const hasFailed = deliveries.some((d) => d.status === "failed");
    const hasPending = deliveries.some((d) => d.status === "pending");

    if (hasFailed && !hasDelivered)
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    if (hasPending) return <Clock className="w-4 h-4 text-yellow-600" />;
    if (hasDelivered) return <CheckCircle className="w-4 h-4 text-green-600" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getMessageTypeColor = (type: string | null) => {
    switch (type) {
      case "emergency":
        return "text-red-600";
      case "reminder":
        return "text-yellow-600";
      case "update":
        return "text-green-600";
      case "announcement":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-4">
      {communications.map((communication) => (
        <div
          key={communication.id}
          className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex-shrink-0 mt-1">
            {getStatusIcon(communication)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {communication.subject}
              </h4>
              <span
                className={`text-xs uppercase font-medium ${getMessageTypeColor(
                  communication.message_type
                )}`}
              >
                {communication.message_type || "announcement"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {communication.sent_at
                ? `Sent ${new Date(communication.sent_at).toLocaleString()}`
                : `Created ${new Date(
                    communication.created_at
                  ).toLocaleString()}`}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="text-xs text-gray-500">
                {communication.communication_deliveries.length} recipient
                {communication.communication_deliveries.length !== 1 ? "s" : ""}
              </div>
              <div className="flex items-center space-x-1">
                {communication.communication_deliveries.some(
                  (d) => d.delivery_channel === "email"
                ) && <Mail className="w-3 h-3 text-gray-400" />}
                {communication.communication_deliveries.some(
                  (d) => d.delivery_channel === "sms"
                ) && <MessageCircle className="w-3 h-3 text-gray-400" />}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {
                communication.communication_deliveries.filter(
                  (d) => d.status === "delivered" || d.status === "sent"
                ).length
              }
              /{communication.communication_deliveries.length} delivered
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
