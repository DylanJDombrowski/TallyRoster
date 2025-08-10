"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, ExternalLink } from "lucide-react";
import Image from "next/image";
import { deleteSponsor, updateSponsorsOrder } from "@/lib/actions";
import { SponsorForm } from "./sponsor-form";
import { useToast } from "@/app/components/toast-provider";

interface Sponsor {
  id: string;
  name: string;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  position: number | null;
  active: boolean | null;
  organization_id: string;
  created_at?: string;
}

interface SponsorsManagerProps {
  initialSponsors: Sponsor[];
  organizationId: string;
}

export function SponsorsManager({
  initialSponsors,
  organizationId,
}: SponsorsManagerProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>(initialSponsors);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { showToast } = useToast();

  const handleSaveSuccess = (savedSponsor: Sponsor, isNew: boolean) => {
    if (isNew) {
      setSponsors((prev) => [...prev, savedSponsor]);
    } else {
      setSponsors((prev) =>
        prev.map((s) => (s.id === savedSponsor.id ? savedSponsor : s))
      );
    }
    setEditingSponsor(null);
    setShowForm(false);
    showToast(
      isNew ? "Sponsor added successfully!" : "Sponsor updated successfully!",
      "success"
    );
  };

  const handleDelete = async (sponsor: Sponsor) => {
    if (window.confirm(`Are you sure you want to delete ${sponsor.name}?`)) {
      const result = await deleteSponsor(sponsor.id);
      if (result.success) {
        setSponsors((prev) => prev.filter((s) => s.id !== sponsor.id));
        showToast("Sponsor deleted successfully!", "success");
      } else {
        showToast(result.message || "Failed to delete sponsor", "error");
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("dragIndex", index.toString());
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData("dragIndex"));

    if (dragIndex === dropIndex) {
      setIsDragging(false);
      return;
    }

    const newSponsors = [...sponsors];
    const [draggedSponsor] = newSponsors.splice(dragIndex, 1);
    newSponsors.splice(dropIndex, 0, draggedSponsor);

    setSponsors(newSponsors);
    setIsDragging(false);

    // Update positions in database
    const sponsorIds = newSponsors.map((s) => s.id);
    const result = await updateSponsorsOrder(sponsorIds);

    if (!result.success) {
      showToast("Failed to update order", "error");
      setSponsors(initialSponsors); // Revert on failure
    }
  };

  if (showForm) {
    return (
      <SponsorForm
        sponsorToEdit={editingSponsor}
        onSaveSuccess={handleSaveSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingSponsor(null);
        }}
        organizationId={organizationId}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {sponsors.length} {sponsors.length === 1 ? "sponsor" : "sponsors"}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sponsor
        </button>
      </div>

      {sponsors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sponsors yet
            </h3>
            <p className="text-gray-500 mb-4">
              Add sponsors to showcase your partners and supporters on your
              public website.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Sponsor
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-500">
              Drag and drop to reorder how sponsors appear on your website
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            {sponsors.map((sponsor, index) => (
              <div
                key={sponsor.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors cursor-move ${
                  isDragging ? "opacity-50" : ""
                }`}
              >
                <GripVertical className="w-5 h-5 text-gray-400" />

                {sponsor.logo_url ? (
                  <Image
                    src={sponsor.logo_url}
                    alt={sponsor.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {sponsor.name}
                  </h3>
                  {sponsor.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {sponsor.description}
                    </p>
                  )}
                  {sponsor.website_url && (
                    <a
                      href={sponsor.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center mt-1"
                    >
                      Visit website
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditingSponsor(sponsor);
                      setShowForm(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sponsor)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
