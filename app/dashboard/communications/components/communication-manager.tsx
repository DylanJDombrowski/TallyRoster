// app/dashboard/communications/components/communication-manager.tsx
"use client";

import { useState } from "react";
import { Send, MessageSquare, Plus, TrendingUp } from "lucide-react";
import { MessageComposer } from "./message-composer";
import { MessageHistory } from "./message-history";
import { MessageTemplates } from "./message-templates";
import { DeliveryAnalytics } from "./delivery-analytics";

interface Team {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface Communication {
  id: string;
  subject: string;
  content: string;
  message_type: string | null;
  priority: string | null;
  created_at: string;
  sent_at: string | null;
  target_all_org: boolean | null;
  target_teams: string[] | null;
  target_groups: string[] | null;
  target_individuals: string[] | null;
  communication_deliveries: {
    status: string | null;
    delivery_channel: string;
    sent_at: string | null;
    delivered_at: string | null;
  }[];
}

interface CommunicationManagerProps {
  organizationId: string;
  userRole: string;
  teams: Team[];
  groups: Group[];
  recentCommunications: Communication[];
}

export function CommunicationManager({
  organizationId,
  userRole,
  teams,
  groups,
  recentCommunications,
}: CommunicationManagerProps) {
  const [activeTab, setActiveTab] = useState<
    "compose" | "history" | "templates" | "analytics"
  >("compose");
  const [showMobileComposer, setShowMobileComposer] = useState(false);

  // Calculate quick stats from recent communications
  const totalMessages = recentCommunications.length;
  const deliveredMessages = recentCommunications.filter((comm) =>
    comm.communication_deliveries.some((del) => del.status === "delivered")
  ).length;
  const pendingMessages = recentCommunications.filter(
    (comm) =>
      !comm.sent_at ||
      comm.communication_deliveries.some((del) => del.status === "pending")
  ).length;

  const deliveryRate =
    totalMessages > 0
      ? Math.round((deliveredMessages / totalMessages) * 100)
      : 0;

  const tabs = [
    { id: "compose", label: "Compose", icon: Send, count: null },
    {
      id: "history",
      label: "History",
      icon: MessageSquare,
      count: totalMessages,
    },
    { id: "templates", label: "Templates", icon: Plus, count: null },
    { id: "analytics", label: "Analytics", icon: TrendingUp, count: null },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 md:hidden">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Communications</h1>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-600">{totalMessages} sent</span>
              <span className="text-green-600">{deliveryRate}% delivered</span>
            </div>
            <button
              onClick={() => setShowMobileComposer(true)}
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex border-t border-gray-200 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-1 text-xs font-medium text-center ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="ml-1 bg-gray-200 text-gray-700 text-xs px-1 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Desktop Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Team Communications
                </h1>
                <p className="text-gray-600 mt-1">
                  Send messages and track delivery to players and parents
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {totalMessages}
                  </div>
                  <div className="text-sm text-gray-600">Messages Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {deliveryRate}%
                  </div>
                  <div className="text-sm text-gray-600">Delivery Rate</div>
                </div>
                {pendingMessages > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {pendingMessages}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="mt-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                    {tab.count !== null && (
                      <span className="ml-2 bg-gray-100 text-gray-900 text-xs px-2 py-1 rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {activeTab === "compose" && (
          <MessageComposer
            organizationId={organizationId}
            teams={teams}
            groups={groups}
            userRole={userRole}
            onMessageSent={() => {
              // Refresh the page or update state
              window.location.reload();
            }}
          />
        )}

        {activeTab === "history" && (
          <MessageHistory communications={recentCommunications} teams={teams} />
        )}

        {activeTab === "templates" && (
          <MessageTemplates organizationId={organizationId} />
        )}

        {activeTab === "analytics" && (
          <DeliveryAnalytics communications={recentCommunications} />
        )}
      </div>

      {/* Mobile Composer Modal */}
      {showMobileComposer && (
        <div className="fixed inset-0 bg-white z-50 md:hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">New Message</h2>
            <button
              onClick={() => setShowMobileComposer(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="p-4">
            <MessageComposer
              organizationId={organizationId}
              teams={teams}
              groups={groups}
              userRole={userRole}
              onMessageSent={() => {
                setShowMobileComposer(false);
                window.location.reload();
              }}
              isMobile={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
