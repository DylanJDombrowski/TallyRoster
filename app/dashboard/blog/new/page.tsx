import BlogPostForm from "../components/BlogPostForm";

export default function NewBlogPostPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Blog Post
        </h1>
        <p className="text-gray-600">
          Share updates, achievements, and stories with your community
        </p>
      </div>

      <BlogPostForm />
    </div>
  );
}
