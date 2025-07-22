"use client";

import { deleteBlogPost } from "@/lib/actions/blog";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteBlogPostButtonProps {
  postId: string;
  postTitle: string;
}

export default function DeleteBlogPostButton({
  postId,
  postTitle,
}: DeleteBlogPostButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${postTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBlogPost(postId);
      if (result.success) {
        router.refresh(); // Refresh the page to update the list
      } else {
        alert(result.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting the post");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
      title={isDeleting ? "Deleting..." : "Delete"}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
