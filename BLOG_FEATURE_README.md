# Blog Feature Documentation

## Overview

The blog feature is a multi-tenant blogging system that allows organizations to create, manage, and display blog posts on their public websites. Each organization can manage their own blog content through the dashboard.

## Features

### Dashboard Features (Admin/Coach Access)

- ✅ Create and edit blog posts with rich text editor (Tiptap)
- ✅ Draft and published status workflow
- ✅ Sports-specific metadata (team, season, tournament, location, placement)
- ✅ Image uploads via Cloudinary with optimization
- ✅ Preview posts before publishing
- ✅ Delete posts with confirmation
- ✅ List all posts with filters and search

### Public Website Features

- ✅ Public blog listing page at `/blog`
- ✅ Individual blog post pages at `/blog/[slug]`
- ✅ SEO metadata and Open Graph tags
- ✅ Responsive design matching organization theme
- ✅ Sports-specific tag display
- ✅ Author attribution

### Technical Features

- ✅ Multi-tenant architecture (organization-scoped)
- ✅ Row Level Security (RLS) policies
- ✅ Slug generation and uniqueness
- ✅ Rich text content with HTML sanitization
- ✅ Image optimization via Cloudinary
- ✅ Server-side rendering (SSR)

## File Structure

```
app/
├── dashboard/blog/
│   ├── page.tsx                    # Blog post listing
│   ├── new/page.tsx               # Create new post
│   ├── [id]/
│   │   ├── edit/page.tsx          # Edit existing post
│   │   └── preview/page.tsx       # Preview post
│   └── components/
│       ├── BlogPostForm.tsx       # Post creation/editing form
│       └── DeleteBlogPostButton.tsx
├── sites/[subdomain]/blog/
│   ├── page.tsx                   # Public blog listing
│   └── [slug]/page.tsx            # Individual blog post
├── components/
│   ├── RichTextEditor.tsx         # Tiptap editor with Cloudinary
│   └── CloudinaryUpload.tsx       # Image upload component
└── lib/actions/blog.ts            # Server actions for blog operations
```

## Database Schema

The blog posts are stored in the `blog_posts` table with the following structure:

```sql
blog_posts (
  id                uuid PRIMARY KEY,
  title             text NOT NULL,
  slug              text NOT NULL UNIQUE,
  short_description text,
  content           text NOT NULL,
  image_url         text,
  published_date    date NOT NULL,
  team_name         text,
  season            text,
  location          text,
  tournament_name   text,
  place             text,
  status            text DEFAULT 'published',
  author_id         uuid REFERENCES auth.users(id),
  organization_id   uuid NOT NULL REFERENCES organizations(id),
  created_at        timestamp DEFAULT now()
)
```

## Required Supabase Changes

Run these SQL commands in your Supabase SQL editor:

```sql
-- Drop the existing restrictive admin-only policy
DROP POLICY IF EXISTS "Allow admins full access to blog posts" ON "public"."blog_posts";

-- Add foreign key constraint for author_id if it doesn't exist
ALTER TABLE "public"."blog_posts"
DROP CONSTRAINT IF EXISTS "blog_posts_author_id_fkey";

ALTER TABLE "public"."blog_posts"
ADD CONSTRAINT "blog_posts_author_id_fkey"
FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id");

-- Allow organization members to manage blog posts in their organization
CREATE POLICY "Allow org members to manage blog posts in their org" ON "public"."blog_posts"
USING (
  "organization_id" IN (
    SELECT "user_organization_roles"."organization_id"
    FROM "public"."user_organization_roles"
    WHERE "user_organization_roles"."user_id" = auth.uid()
    AND "user_organization_roles"."role" IN ('admin', 'coach', 'member')
  )
);

-- Allow public read access to published blog posts
CREATE POLICY "Allow public read access to published blog posts" ON "public"."blog_posts"
FOR SELECT
TO "anon", "authenticated"
USING ("status" = 'published');
```

## Environment Variables

Ensure these Cloudinary environment variables are set:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=blog-images  # or your preferred preset
```

## Usage

### Creating a Blog Post

1. Navigate to `/dashboard/blog`
2. Click "New Post"
3. Fill in the post details:
   - **Title**: Main headline
   - **Slug**: URL-friendly version (auto-generated)
   - **Short Description**: For previews and SEO
   - **Content**: Rich text content with Tiptap editor
   - **Featured Image**: Upload via Cloudinary
   - **Sports Fields**: Team, season, location, tournament, placement
4. Save as Draft or Publish immediately

### Rich Text Editor Features

- **Text Formatting**: Bold, italic, underline
- **Lists**: Bullet points and numbered lists
- **Links**: Add hyperlinks
- **Images**: Upload and insert images via Cloudinary
- **Quotes**: Block quotes
- **Undo/Redo**: Standard editing controls

### Image Uploads

Images are automatically uploaded to Cloudinary with:

- Auto format optimization (WebP when supported)
- Auto quality optimization
- Signed uploads for security
- Folder organization (`blog-posts/`)

### Public Display

Blog posts appear on the public website at:

- **Blog Index**: `https://[subdomain].yoursite.com/blog`
- **Individual Posts**: `https://[subdomain].yoursite.com/blog/[slug]`

### Sports Metadata

Blog posts can include sports-specific information:

- **Team Name**: Which team the post is about
- **Season**: Sports season (e.g., "2025 Spring")
- **Location**: Where events took place
- **Tournament**: Tournament or event name
- **Placement**: Results or achievements

These appear as colored tags on the public blog pages.

## Access Control

- **Admins**: Full access to all blog posts in their organization
- **Coaches**: Full access to all blog posts in their organization
- **Members**: Full access to all blog posts in their organization
- **Public**: Read access to published posts only

## Performance Considerations

- Server-side rendering for better SEO
- Optimized images via Cloudinary
- Efficient database queries with proper indexing
- Minimal client-side JavaScript

## Future Enhancements

Potential improvements:

- [ ] Categories and tags system
- [ ] Comments system
- [ ] Social media sharing
- [ ] Email notifications for new posts
- [ ] RSS feed generation
- [ ] Search functionality
- [ ] Analytics and view tracking
- [ ] Scheduled publishing
- [ ] Team-specific access controls
