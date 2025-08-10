// app/dashboard/site-customizer/components/links-manager.tsx - ENHANCED CRUD VERSION
"use client";

import { useToast } from "@/app/components/toast-provider";
import { Database } from "@/lib/database.types";
import { useCallback, useEffect, useState } from "react";
import {
  deleteOrganizationLink,
  getOrganizationLinks,
  updateLinksOrder,
} from "@/lib/actions";
import { DraggableLinks } from "./draggable-links";
import { LinkForm } from "./link-form";

type OrganizationLink =
  Database["public"]["Tables"]["organization_links"]["Row"];

export function LinksManager() {
  const [links, setLinks] = useState<OrganizationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<OrganizationLink | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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
    setShowCreateForm(false); // Close create form
    showToast("Link saved successfully!", "success");
  }, [fetchLinks, showToast]);

  // Handle link deletion with confirmation
  const handleDeleteClick = useCallback((linkId: string) => {
    setDeleteConfirmId(linkId);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirmId) return;

    const result = await deleteOrganizationLink(deleteConfirmId);
    if (result.success) {
      showToast(result.message, "success");
      fetchLinks(); // Refresh the list
    } else {
      showToast(result.message, "error");
    }
    setDeleteConfirmId(null);
  }, [deleteConfirmId, fetchLinks, showToast]);

  const cancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Handle edit button click
  const handleEdit = useCallback((link: OrganizationLink) => {
    setEditingLink(link);
    setShowCreateForm(false); // Close create form if open
  }, []);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingLink(null);
  }, []);

  // Handle create new link
  const handleCreateNew = useCallback(() => {
    setShowCreateForm(true);
    setEditingLink(null); // Close edit form if open
  }, []);

  const handleCancelCreate = useCallback(() => {
    setShowCreateForm(false);
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
          Forms & Links Manager
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-slate-600">Loading links...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Forms & Links Manager
        </h3>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={showCreateForm || editingLink !== null}
        >
          + Add New Link
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-6">
        Create accordion sections with links to important forms and resources
        that will appear on your public &quot;
        {links.length > 0 ? "Forms & Links" : "Forms & Resources"}&quot; page.
      </p>

      {/* Create New Link Form */}
      {showCreateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-blue-900">Create New Link</h4>
            <button
              onClick={handleCancelCreate}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Cancel
            </button>
          </div>
          <LinkForm onSuccess={handleLinkSaved} buttonText="Create Link" />
        </div>
      )}

      {/* Edit Link Form */}
      {editingLink && (
        <div className="mb-6 p-4 border rounded-lg bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-amber-900">Edit Link</h4>
            <button
              onClick={handleCancelEdit}
              className="text-amber-600 hover:text-amber-800 text-sm"
            >
              Cancel
            </button>
          </div>
          <LinkForm
            key={editingLink.id} // Force re-render when switching links
            onSuccess={handleLinkSaved}
            buttonText="Update Link"
            initialData={{
              id: editingLink.id,
              title: editingLink.title,
              description: editingLink.description,
              url: editingLink.url,
            }}
          />
        </div>
      )}

      {/* List of Existing Links with Drag-and-Drop */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-slate-700">
            Existing Links ({links.length})
          </h4>
          {links.length > 1 && (
            <span className="text-sm text-slate-500">Drag to reorder</span>
          )}
        </div>

        {links.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <svg
              className="mx-auto h-12 w-12 text-slate-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>No links created yet.</p>
            <p className="text-sm">
              Click &quot;Add New Link&quot; to get started.
            </p>
          </div>
        ) : (
          <DraggableLinks
            links={links}
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            editingLinkId={editingLink?.id}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Delete Link
            </h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this link? This action cannot be
              undone and will remove it from your public website.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Note */}
      {links.length > 0 && (
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border">
          <p className="text-sm text-slate-600">
            <strong>💡 Preview:</strong> These links will appear as expandable
            accordion sections on your public Forms & Links page. Visitors can
            click each section to expand and access the resources.
          </p>
        </div>
      )}
    </div>
  );
}
