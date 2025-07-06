// app/dashboard/site-customizer/components/draggable-links.tsx
"use client";

import { useState } from "react";
import { Database } from "@/lib/database.types";

type OrganizationLink =
  Database["public"]["Tables"]["organization_links"]["Row"];

interface DraggableLinksProps {
  links: OrganizationLink[];
  onReorder: (reorderedLinks: OrganizationLink[]) => void;
  onEdit: (link: OrganizationLink) => void;
  onDelete: (linkId: string) => void;
  editingLinkId?: string;
}

export function DraggableLinks({
  links,
  onReorder,
  onEdit,
  onDelete,
  editingLinkId,
}: DraggableLinksProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newLinks = [...links];
    const draggedLink = newLinks[draggedIndex];

    // Remove the dragged item
    newLinks.splice(draggedIndex, 1);

    // Insert it at the new position
    newLinks.splice(dropIndex, 0, draggedLink);

    onReorder(newLinks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (links.length === 0) {
    return <p className="text-slate-500 text-sm">No links created yet.</p>;
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={link.id}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            flex items-center justify-between p-3 border rounded-md transition-all cursor-move
            ${
              editingLinkId === link.id
                ? "bg-blue-50 border-blue-200"
                : "bg-white"
            }
            ${draggedIndex === index ? "opacity-50 scale-95" : ""}
            ${
              dragOverIndex === index && draggedIndex !== index
                ? "border-blue-400 bg-blue-50"
                : ""
            }
            hover:shadow-md
          `}
        >
          {/* Drag Handle */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1 text-slate-400 hover:text-slate-600">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div className="w-1 h-1 bg-current rounded-full"></div>
            </div>

            {/* Link Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 truncate">
                {link.title}
              </p>
              {link.description && (
                <p className="text-sm text-slate-600 mt-1">
                  {link.description}
                </p>
              )}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()} // Prevent drag when clicking link
              >
                {link.url}
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(link);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 hover:bg-blue-50 rounded"
              disabled={editingLinkId === link.id}
            >
              {editingLinkId === link.id ? "Editing..." : "Edit"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(link.id);
              }}
              className="text-sm text-red-600 hover:text-red-800 px-2 py-1 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
