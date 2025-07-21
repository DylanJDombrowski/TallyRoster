// app/dashboard/communications/components/message-templates.tsx
"use client";

import { useState } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  MessageSquare,
  Clock,
  AlertTriangle,
  Users,
  Eye,
} from "lucide-react";

// Built-in templates that every organization gets
const builtInTemplates = [
  {
    id: "practice-canceled",
    name: "Practice Canceled",
    subject: "Practice Canceled - {date}",
    content:
      "Hi everyone,\n\nDue to {reason}, today's practice has been canceled. We will resume our regular schedule on {next_date}.\n\nStay safe and see you next time!\n\nCoach",
    messageType: "announcement",
    isBuiltIn: true,
    category: "Practice",
    organizationId: "",
  },
  {
    id: "game-reminder",
    name: "Game Day Reminder",
    subject: "Game Day - {opponent} at {time}",
    content:
      "Team,\n\nJust a reminder about our game today:\n\n📍 Location: {location}\n⏰ Time: {time}\n🥎 Opponent: {opponent}\n\nPlease arrive 30 minutes early for warm-up. Don't forget your water bottles and positive attitudes!\n\nLet's go team!",
    messageType: "reminder",
    isBuiltIn: true,
    category: "Games",
    organizationId: "",
  },
  {
    id: "paperwork-reminder",
    name: "Paperwork Reminder",
    subject: "Action Required: Missing Paperwork",
    content:
      "Parents,\n\nWe're still missing some required paperwork for the season. Please ensure the following are submitted by {deadline}:\n\n• Medical forms\n• Emergency contact information\n• Season agreements\n\nContact me if you have any questions. Thanks!\n\nCoach",
    messageType: "reminder",
    isBuiltIn: true,
    category: "Administrative",
    organizationId: "",
  },
  {
    id: "tournament-info",
    name: "Tournament Information",
    subject: "Tournament Details - {tournament_name}",
    content:
      "Families,\n\nHere are the details for our upcoming tournament:\n\n🏆 Tournament: {tournament_name}\n📅 Dates: {dates}\n📍 Location: {location}\n⏰ First Game: {first_game_time}\n\nMore details and schedule will follow. Get excited!\n\nCoach",
    messageType: "update",
    isBuiltIn: true,
    category: "Tournaments",
    organizationId: "",
  },
  {
    id: "weather-update",
    name: "Weather Update",
    subject: "Weather Alert - {date}",
    content:
      "Team,\n\nDue to weather conditions, please check your email and our team page for updates about {event}.\n\nWe will make a final decision by {decision_time} and notify everyone immediately.\n\nStay safe!\n\nCoach",
    messageType: "emergency",
    isBuiltIn: true,
    category: "Weather",
    organizationId: "",
  },
  {
    id: "fundraiser-announcement",
    name: "Fundraiser Announcement",
    subject: "Team Fundraiser - {fundraiser_name}",
    content:
      "Dear Families,\n\nWe're excited to announce our upcoming fundraiser: {fundraiser_name}!\n\n💰 Goal: {goal}\n📅 Timeline: {timeline}\n📋 How to participate: {instructions}\n\nYour support helps make our season possible. Thank you for everything you do for our team!\n\nCoach",
    messageType: "announcement",
    isBuiltIn: true,
    category: "Fundraising",
    organizationId: "",
  },
];

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  messageType: string;
  isBuiltIn: boolean;
  category: string;
  organizationId: string;
}

// 1. DEFINE THE PROPS INTERFACE
interface MessageTemplatesProps {
  organizationId: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function MessageTemplates({ organizationId }: MessageTemplatesProps) {
  const [templates] = useState<Template[]>(builtInTemplates); // In real app, fetch from API
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "announcement":
        return MessageSquare;
      case "reminder":
        return Clock;
      case "emergency":
        return AlertTriangle;
      case "update":
        return Users;
      default:
        return MessageSquare;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "announcement":
        return "text-blue-600 bg-blue-100";
      case "reminder":
        return "text-yellow-600 bg-yellow-100";
      case "emergency":
        return "text-red-600 bg-red-100";
      case "update":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const copyTemplate = async (template: Template) => {
    try {
      await navigator.clipboard.writeText(
        `Subject: ${template.subject}\n\n${template.content}`
      );
      // In real app, show toast notification
      console.log("Template copied to clipboard");
    } catch (err) {
      console.error("Failed to copy template:", err);
    }
  };

  const handleUseTemplate = (template: Template) => {
    // In real app, this would populate the composer
    console.log("Using template:", template);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Message Templates
          </h2>
          <p className="text-gray-600 mt-1">
            Pre-built and custom templates for common messages
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.slice(1).map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const MessageIcon = getMessageTypeIcon(template.messageType);
          return (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div
                    className={`p-1 rounded ${getMessageTypeColor(
                      template.messageType
                    )}`}
                  >
                    <MessageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {template.category}
                    </span>
                  </div>
                </div>
                {template.isBuiltIn && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    Built-in
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Subject:
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {template.subject}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Preview:
                </div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                  {template.content.slice(0, 150)}
                  {template.content.length > 150 && "..."}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="flex-1 flex items-center justify-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Use
                </button>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                </button>
                <button
                  onClick={() => copyTemplate(template)}
                  className="flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                </button>
                {!template.isBuiltIn && (
                  <>
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="flex items-center justify-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => {
                        /* Delete template */
                      }}
                      className="flex items-center justify-center px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter"
              : "Create your first custom template to get started"}
          </p>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const MessageIcon = getMessageTypeIcon(
                      selectedTemplate.messageType
                    );
                    return (
                      <div
                        className={`p-2 rounded ${getMessageTypeColor(
                          selectedTemplate.messageType
                        )}`}
                      >
                        <MessageIcon className="w-5 h-5" />
                      </div>
                    );
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedTemplate.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedTemplate.category} •{" "}
                      {selectedTemplate.messageType}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Subject Line
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg font-mono text-sm">
                    {selectedTemplate.subject}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Message Content
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap text-sm">
                    {selectedTemplate.content}
                  </div>
                </div>

                {selectedTemplate.content.includes("{") && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Template Variables
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Text in curly braces like {"{date}"} are placeholders that
                      you can customize when using this template.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    onClick={() => {
                      handleUseTemplate(selectedTemplate);
                      setSelectedTemplate(null);
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Use This Template
                  </button>
                  <button
                    onClick={() => copyTemplate(selectedTemplate)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Template Modal */}
      {(isCreating || editingTemplate) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {isCreating ? "Create Template" : "Edit Template"}
                </h2>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTemplate(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Practice Canceled"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="Practice">Practice</option>
                      <option value="Games">Games</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Tournaments">Tournaments</option>
                      <option value="Weather">Weather</option>
                      <option value="Fundraising">Fundraising</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      {
                        value: "announcement",
                        label: "Announcement",
                        icon: MessageSquare,
                      },
                      { value: "reminder", label: "Reminder", icon: Clock },
                      {
                        value: "emergency",
                        label: "Emergency",
                        icon: AlertTriangle,
                      },
                      { value: "update", label: "Update", icon: Users },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className="flex items-center p-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                      >
                        <type.icon className="w-4 h-4 mr-2" />
                        <span className="text-sm">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Practice Canceled - {date}"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Use {"{variable_name}"} for placeholders you can customize
                    later
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Content *
                  </label>
                  <textarea
                    rows={8}
                    placeholder="Enter your message template..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
