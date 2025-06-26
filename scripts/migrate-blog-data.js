// scripts/migrate-blog-data.js
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the existing blog data
const blogDataPath = path.join(__dirname, "../public/data/blog-posts.json");
const blogData = JSON.parse(fs.readFileSync(blogDataPath, "utf8"));

async function migrateBlogData() {
  console.log(`Starting migration of ${blogData.length} blog posts...`);

  const transformedPosts = blogData.map((post) => ({
    title: post.title,
    slug: post.slug,
    short_description: post.shortDescription,
    content: post.content,
    image_url: `blog/${post.image}`, // Assuming images will be in a 'blog' folder in Supabase storage
    published_date: post.date,
    team_name: post.teamName,
    season: post.season,
    location: post.location,
    tournament_name: post.tournamentName,
    place: post.place,
    status: "published",
  }));

  // Insert all posts
  const { data, error } = await supabase
    .from("blog_posts")
    .insert(transformedPosts);

  if (error) {
    console.error("Error migrating blog data:", error);
    process.exit(1);
  }

  console.log(`Successfully migrated ${transformedPosts.length} blog posts!`);
  console.log("Sample of migrated data:", data?.[0]);
}

// Run the migration
migrateBlogData().catch(console.error);
