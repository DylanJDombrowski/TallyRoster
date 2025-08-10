import { getBlogPost } from "@/lib/actions";
import { notFound } from "next/navigation";
import BlogPostForm from "../../components/BlogPostForm";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getBlogPost(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Blog Post</h1>
        <p className="text-gray-600">Update your blog post content</p>
      </div>

      <BlogPostForm initialData={result.data} />
    </div>
  );
}
