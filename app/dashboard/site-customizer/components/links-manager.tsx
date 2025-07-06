// app/dashboard/site-customizer/components/links-manager.tsx (with persistent drag-and-drop)
"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/app/components/toast-provider";
import {
  getOrganizationLinks,
  deleteOrganizationLink,
  updateLinksOrder,
} from "../actions";
import { LinkForm } from "./link-form";
import { DraggableLinks } from "./draggable-links";
import { Database } from "@/lib/database.types";

type OrganizationLink =
  Database["public"]["Tables"]["organization_links"]["Row"];

export function LinksManager() {
  const [links, setLinks] = useState<OrganizationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<OrganizationLink | null>(null);
  const { showToast } = useToast();

  // Fetch links on component mount
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const { data, success, message } = await getOrganizationLinks();

    if (success) {
      setLinks(data);
    } else {
      showToast(message || "Error loading links", "error");
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Handle successful link creation/update
  const handleLinkSaved = useCallback(() => {
    fetchLinks(); // Refresh the list
    setEditingLink(null); // Close edit mode
  }, [fetchLinks]);

  // Handle link deletion
  const handleDelete = useCallback(
    async (linkId: string) => {
      if (!window.confirm("Are you sure you want to delete this link?")) {
        return;
      }

      const result = await deleteOrganizationLink(linkId);
      if (result.success) {
        showToast(result.message, "success");
        fetchLinks(); // Refresh the list
      } else {
        showToast(result.message, "error");
      }
    },
    [fetchLinks, showToast]
  );

  // Handle edit button click
  const handleEdit = useCallback((link: OrganizationLink) => {
    setEditingLink(link);
  }, []);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingLink(null);
  }, []);

  // Handle drag-and-drop reordering with persistence
  const handleReorder = useCallback(
    async (reorderedLinks: OrganizationLink[]) => {
      // Optimistically update the UI
      setLinks(reorderedLinks);

      try {
        // Extract just the IDs in the new order
        const linkIds = reorderedLinks.map((link) => link.id);

        // Call the server action to persist the order
        const result = await updateLinksOrder(linkIds);

        if (result.success) {
          showToast(result.message, "success");
        } else {
          // If server update failed, revert the UI change
          showToast(result.message, "error");
          fetchLinks(); // Refresh to get the actual order from server
        }
      } catch {
        // If anything goes wrong, revert and show error
        showToast("Failed to save link order", "error");
        fetchLinks();
      }
    },
    [showToast, fetchLinks]
  );

  if (loading) {
    return (
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Forms & Links
        </h3>
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="border-t pt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Forms & Links
      </h3>

      <p className="text-sm text-slate-600 mb-4">
        Create links to important forms and resources that will appear on your
        public website.
      </p>

      {/* Form to Create a New Link or Edit Existing */}
      <div className="mb-6 p-4 border rounded-lg bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">
            {editingLink ? "Edit Link" : "Add New Link"}
          </h4>
          {editingLink && (
            <button
              onClick={handleCancelEdit}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
        <LinkForm
          key={editingLink?.id || "new"} // Force re-render when switching between create/edit
          onSuccess={handleLinkSaved}
          buttonText={editingLink ? "Update Link" : "Create Link"}
          initialData={
            editingLink
              ? {
                  id: editingLink.id,
                  title: editingLink.title,
                  description: editingLink.description,
                  url: editingLink.url,
                }
              : undefined
          }
        />
      </div>

      {/* List of Existing Links with Drag-and-Drop */}
      <div>
        <h4 className="font-semibold mb-3 text-slate-700">
          Existing Links{" "}
          {links.length > 1 && (
            <span className="text-sm font-normal text-slate-500">
              (Drag to reorder)
            </span>
          )}
        </h4>
        <DraggableLinks
          links={links}
          onReorder={handleReorder}
          onEdit={handleEdit}
          onDelete={handleDelete}
          editingLinkId={editingLink?.id}
        />
      </div>
    </div>
  );
}
