// app/dashboard/communications/components/message-history.tsx
"use client";

import { useState, useMemo } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  Target,
} from "lucide-react";

interface Team {
  id: string;
  name: string;
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

interface MessageHistoryProps {
  communications: Communication[];
  teams: Team[];
}

export function MessageHistory({ communications, teams }: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  const filteredCommunications = useMemo(() => {
    return communications.filter((comm) => {
      const matchesSearch =
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        typeFilter === "all" || comm.message_type === typeFilter;

      let matchesStatus = true;
      if (statusFilter === "sent") {
        matchesStatus = !!comm.sent_at;
      } else if (statusFilter === "delivered") {
        matchesStatus = comm.communication_deliveries.some(
          (del) => del.status === "delivered"
        );
      } else if (statusFilter === "pending") {
        matchesStatus =
          !comm.sent_at ||
          comm.communication_deliveries.some((del) => del.status === "pending");
      }

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [communications, searchTerm, typeFilter, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not sent";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (comm: Communication) => {
    if (!comm.sent_at) return "text-yellow-600 bg-yellow-50";

    const hasDelivered = comm.communication_deliveries.some(
      (del) => del.status === "delivered"
    );
    const hasFailures = comm.communication_deliveries.some(
      (del) => del.status === "failed"
    );

    if (hasFailures && !hasDelivered) return "text-red-600 bg-red-50";
    if (hasDelivered) return "text-green-600 bg-green-50";
    return "text-blue-600 bg-blue-50";
  };

  const getStatusText = (comm: Communication) => {
    if (!comm.sent_at) return "Scheduled";

    const delivered = comm.communication_deliveries.filter(
      (del) => del.status === "delivered"
    ).length;
    const failed = comm.communication_deliveries.filter(
      (del) => del.status === "failed"
    ).length;
    const pending = comm.communication_deliveries.filter(
      (del) => del.status === "pending"
    ).length;
    const total = comm.communication_deliveries.length;

    if (total === 0) return "Sent";
    if (delivered === total) return `Delivered (${delivered})`;
    if (failed > 0) return `${delivered}/${total} delivered`;
    if (pending > 0) return `${delivered}/${total} delivered`;
    return `${delivered}/${total}`;
  };

  const getTargetDescription = (comm: Communication) => {
    if (comm.target_all_org) return "Entire Organization";

    const targets = [];
    if (comm.target_teams && comm.target_teams.length > 0) {
      const teamNames = comm.target_teams.map(
        (teamId) =>
          teams.find((team) => team.id === teamId)?.name || "Unknown Team"
      );
      targets.push(teamNames.join(", "));
    }
    if (comm.target_groups && comm.target_groups.length > 0) {
      targets.push(
        `${comm.target_groups.length} group${
          comm.target_groups.length > 1 ? "s" : ""
        }`
      );
    }

    return targets.join(", ") || "Unknown recipients";
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "urgent":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "normal":
        return "text-blue-600 bg-blue-100";
      case "low":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "announcement":
        return MessageSquare;
      case "reminder":
        return Clock;
      case "emergency":
        return AlertCircle;
      case "update":
        return Users;
      default:
        return MessageSquare;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="announcement">Announcements</option>
                <option value="reminder">Reminders</option>
                <option value="emergency">Emergency</option>
                <option value="update">Updates</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Messages</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending/Scheduled</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCommunications.length} of {communications.length}{" "}
        messages
      </div>

      {/* Message List */}
      <div className="space-y-3">
        {filteredCommunications.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-gray-500">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't sent any messages yet"}
            </p>
          </div>
        ) : (
          filteredCommunications.map((comm) => {
            const TypeIcon = getTypeIcon(comm.message_type);
            const statusColor = getStatusColor(comm);
            const priorityColor = getPriorityColor(comm.priority);

            return (
              <div
                key={comm.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMessage(comm)}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        <TypeIcon className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1 truncate">
                          {comm.subject}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {comm.content}
                        </p>

                        {/* Meta Information */}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(comm.sent_at || comm.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Target className="w-3 h-3 mr-1" />
                            {getTargetDescription(comm)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2 ml-4">
                      {/* Priority Badge */}
                      {comm.priority && comm.priority !== "normal" && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor}`}
                        >
                          {(comm.priority || "").toUpperCase()}
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {getStatusText(comm)}
                      </span>

                      {/* View Details */}
                      <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center">
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Message Details
                </h2>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <p className="text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3 mt-1">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedMessage.message_type || "announcement"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Priority
                    </label>
                    <p className="text-gray-900 capitalize">
                      {selectedMessage.priority || "normal"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sent To
                  </label>
                  <p className="text-gray-900">
                    {getTargetDescription(selectedMessage)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Created
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Sent
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedMessage.sent_at)}
                    </p>
                  </div>
                </div>

                {/* Delivery Stats */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Delivery Status
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {selectedMessage.communication_deliveries.length === 0 ? (
                      <p className="text-gray-600 text-sm">
                        No delivery data available
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {["delivered", "pending", "failed"].map((status) => {
                          const count =
                            selectedMessage.communication_deliveries.filter(
                              (del) => del.status === status
                            ).length;
                          if (count === 0) return null;

                          return (
                            <div
                              key={status}
                              className="flex justify-between text-sm"
                            >
                              <span className="capitalize text-gray-700">
                                {status}:
                              </span>
                              <span
                                className={`font-medium ${
                                  status === "delivered"
                                    ? "text-green-600"
                                    : status === "failed"
                                    ? "text-red-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
