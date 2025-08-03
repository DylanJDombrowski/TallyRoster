// app/dashboard/communications/components/message-composer.tsx
"use client";

import { useState } from "react";
import {
  Send,
  Users,
  Mail,
  MessageSquare,
  AlertTriangle,
  Clock,
  Target,
  FileText,
} from "lucide-react";
import { useToast } from "@/app/components/toast-provider";
import { useSession } from "@/hooks/use-session"; // Using the new session hook

interface Team {
  id: string;
  name: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
}

interface MessageComposerProps {
  organizationId: string;
  teams: Team[];
  groups: Group[];
  userRole: string;
  onMessageSent: () => void;
  isMobile?: boolean;
}

const messageTypes = [
  {
    value: "announcement",
    label: "Announcement",
    icon: MessageSquare,
    color: "bg-blue-500",
  },
  { value: "reminder", label: "Reminder", icon: Clock, color: "bg-yellow-500" },
  {
    value: "emergency",
    label: "Emergency",
    icon: AlertTriangle,
    color: "bg-red-500",
  },
  { value: "update", label: "Update", icon: Users, color: "bg-green-500" },
];

const priorities = [
  { value: "low", label: "Low", color: "text-gray-600" },
  { value: "normal", label: "Normal", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-orange-600" },
  { value: "urgent", label: "URGENT", color: "text-red-600 font-bold" },
];

const quickTemplates = [
  {
    name: "Practice Canceled",
    subject: "Practice Canceled - [Date]",
    content:
      "Hi everyone,\n\nDue to weather conditions, today's practice has been canceled. We will resume our regular schedule on [Next Practice Date].\n\nStay safe and see you next time!",
  },
  {
    name: "Game Update",
    subject: "Game Information - [Date]",
    content:
      "Team,\n\nJust a reminder about our upcoming game:\n\n📍 Location: [Location]\n⏰ Time: [Time]\n🥎 Opponent: [Team Name]\n\nPlease arrive 30 minutes early for warm-up. Don't forget your water bottles and positive attitudes!",
  },
  {
    name: "Paperwork Reminder",
    subject: "Action Required: Missing Paperwork",
    content:
      "Parents,\n\nWe're still missing some required paperwork for the season. Please ensure the following are submitted by [Date]:\n\n• Medical forms\n• Emergency contact information\n• Season agreements\n\nContact me if you have any questions. Thanks!",
  },
  {
    name: "Tournament Information",
    subject: "Tournament Details - [Tournament Name]",
    content:
      "Families,\n\nHere are the details for our upcoming tournament:\n\n🏆 Tournament: [Name]\n📅 Dates: [Dates]\n📍 Location: [Address]\n⏰ First Game: [Time]\n\nMore details and schedule will follow. Get excited!",
  },
];

export function MessageComposer({
  organizationId,
  teams,
  onMessageSent,
  isMobile = false,
}: MessageComposerProps) {
  // Access session data via the new hook instead of direct Supabase calls
  const { user, currentOrg } = useSession();

  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    messageType: "announcement",
    priority: "normal",
    targetAllOrg: false,
    targetTeams: [] as string[],
    targetGroups: [] as string[],
    sendEmail: true,
    sendSms: false,
    scheduledSendAt: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim() || !formData.content.trim()) {
      showToast("Please fill in both subject and message content", "error");
      return;
    }

    if (
      !formData.targetAllOrg &&
      formData.targetTeams.length === 0 &&
      formData.targetGroups.length === 0
    ) {
      showToast("Please select who to send this message to", "error");
      return;
    }

    // REFACTORED: No longer need to fetch user data here - use session data
    if (!user || !currentOrg) {
      showToast("Authentication error. Please refresh and try again.", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/communications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // REFACTORED: Use organizationId from props (derived from session)
          organizationId,
          subject: formData.subject,
          content: formData.content,
          messageType: formData.messageType,
          priority: formData.priority,
          targetAllOrg: formData.targetAllOrg,
          targetTeams:
            formData.targetTeams.length > 0 ? formData.targetTeams : undefined,
          targetGroups:
            formData.targetGroups.length > 0
              ? formData.targetGroups
              : undefined,
          sendEmail: formData.sendEmail,
          sendSms: formData.sendSms,
          scheduledSendAt: formData.scheduledSendAt || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      showToast(
        formData.scheduledSendAt
          ? "Message scheduled successfully!"
          : "Message sent successfully!",
        "success"
      );

      // Reset form
      setFormData({
        subject: "",
        content: "",
        messageType: "announcement",
        priority: "normal",
        targetAllOrg: false,
        targetTeams: [],
        targetGroups: [],
        sendEmail: true,
        sendSms: false,
        scheduledSendAt: "",
      });

      onMessageSent();
    } catch (error) {
      console.error("Error sending message:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to send message",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: (typeof quickTemplates)[0]) => {
    setFormData((prev) => ({
      ...prev,
      subject: template.subject,
      content: template.content,
    }));
    setShowTemplates(false);
  };

  const toggleTeam = (teamId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetTeams: prev.targetTeams.includes(teamId)
        ? prev.targetTeams.filter((id) => id !== teamId)
        : [...prev.targetTeams, teamId],
    }));
  };

  const getTargetSummary = () => {
    if (formData.targetAllOrg) return "Entire Organization";

    const targets = [];
    if (formData.targetTeams.length > 0) {
      const teamNames = formData.targetTeams
        .map((id) => teams.find((team) => team.id === id)?.name)
        .filter(Boolean);
      targets.push(
        `${teamNames.length} team${teamNames.length > 1 ? "s" : ""}: ${teamNames
          .slice(0, 2)
          .join(", ")}${teamNames.length > 2 ? "..." : ""}`
      );
    }
    if (formData.targetGroups.length > 0) {
      targets.push(
        `${formData.targetGroups.length} group${
          formData.targetGroups.length > 1 ? "s" : ""
        }`
      );
    }

    return targets.length > 0 ? targets.join(", ") : "No recipients selected";
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
        isMobile ? "" : "p-6"
      }`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Templates */}
        <div className="flex items-center justify-between">
          <h2
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold text-gray-900`}
          >
            Compose Message
          </h2>
          <button
            type="button"
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <FileText className="w-4 h-4 mr-1" />
            Quick Templates
          </button>
        </div>

        {showTemplates && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Quick Templates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickTemplates.map((template, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="text-left p-3 bg-white rounded border hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900">
                    {template.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {template.subject}
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Hide templates
            </button>
          </div>
        )}

        {/* Message Type & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {messageTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      messageType: type.value,
                    }))
                  }
                  className={`flex items-center p-2 rounded-lg border transition-colors ${
                    formData.messageType === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${type.color}`} />
                  <type.icon className="w-4 h-4 mr-2" />
                  <span className="text-sm">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {priorities.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject *
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            placeholder="Enter message subject..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            placeholder="Type your message here..."
            rows={isMobile ? 4 : 6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <div className="mt-1 text-sm text-gray-500">
            {formData.content.length} characters
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Send To *
            </label>
            <div className="flex items-center text-sm text-gray-600">
              <Target className="w-4 h-4 mr-1" />
              {getTargetSummary()}
            </div>
          </div>

          {/* Everyone Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="targetAllOrg"
              checked={formData.targetAllOrg}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAllOrg: e.target.checked,
                  targetTeams: e.target.checked ? [] : prev.targetTeams,
                  targetGroups: e.target.checked ? [] : prev.targetGroups,
                }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="targetAllOrg"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Send to entire organization
            </label>
          </div>

          {/* Team Selection */}
          {!formData.targetAllOrg && teams.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Select Teams
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`team-${team.id}`}
                      checked={formData.targetTeams.includes(team.id)}
                      onChange={() => toggleTeam(team.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor={`team-${team.id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {team.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Options */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-3"
          >
            Advanced Options
            <span className="ml-1">{showAdvanced ? "▲" : "▼"}</span>
          </button>

          {showAdvanced && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Delivery Options */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Delivery Methods
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendEmail"
                      checked={formData.sendEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sendEmail: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="sendEmail"
                      className="ml-2 text-sm text-gray-700 flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email (Free)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendSms"
                      checked={formData.sendSms}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          sendSms: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled
                    />
                    <label
                      htmlFor="sendSms"
                      className="ml-2 text-sm text-gray-400 flex items-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      SMS (Premium Feature - Coming Soon)
                    </label>
                  </div>
                </div>
              </div>

              {/* Schedule Message */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Schedule Message (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledSendAt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledSendAt: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              !formData.subject.trim() ||
              !formData.content.trim()
            }
            className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                {formData.scheduledSendAt ? "Scheduling..." : "Sending..."}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {formData.scheduledSendAt ? "Schedule Message" : "Send Message"}
              </>
            )}
          </button>

          {!isMobile && (
            <button
              type="button"
              onClick={() => {
                setFormData({
                  subject: "",
                  content: "",
                  messageType: "announcement",
                  priority: "normal",
                  targetAllOrg: false,
                  targetTeams: [],
                  targetGroups: [],
                  sendEmail: true,
                  sendSms: false,
                  scheduledSendAt: "",
                });
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
          )}
        </div>

        {/* Preview/Help */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            💡 Quick Tips
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              • Use [brackets] in templates for easy customization (e.g.,
              [Date], [Time], [Location])
            </li>
            <li>
              • Emergency and Urgent messages get special styling in emails
            </li>
            <li>
              • Recipients include both players and parents when available
            </li>
            <li>
              • Messages are automatically branded with your organization colors
            </li>
          </ul>
        </div>
      </form>
    </div>
  );
}
