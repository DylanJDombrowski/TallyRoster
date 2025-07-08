// scripts/test-multi-tenancy.mjs
// Run this with: node scripts/test-multi-tenancy.mjs

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// --- FIX STARTS HERE ---
// Load environment variables from .env.local at the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
// --- FIX ENDS HERE ---

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function testMultiTenancy() {
  // Add a check to ensure variables are loaded
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase URL or Anon Key.");
    console.error("Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in your .env.local file.");
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log("🧪 Testing Multi-Tenant Data Isolation...\n");

  // 1. Test: Check organizations exist
  console.log("1. Checking organizations...");
  const { data: orgs, error: orgsError } = await supabase.from("organizations").select("id, name, subdomain");

  if (orgsError) {
    console.error("❌ Error fetching organizations:", orgsError);
    return;
  }

  if (!orgs || orgs.length === 0) {
    console.log("⚠️ No organizations found. Please add at least one organization to your database.");
    return;
  }

  console.log(`✅ Found ${orgs.length} organizations:`);
  orgs.forEach((org) => console.log(`   - ${org.name} (${org.subdomain})`));

  if (orgs.length < 2) {
    console.log("\n⚠️  You need at least 2 organizations to properly test data isolation.");
    console.log("   Please create a second test organization in your database.");
    // We can continue the test with one org, but isolation isn't fully proven.
  }

  // 2. Test: Check teams are properly scoped
  console.log("\n2. Checking team isolation...");
  for (const org of orgs) {
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id, name, organization_id")
      .eq("organization_id", org.id);
    if (teamsError) {
      console.error(`❌ Error fetching teams for ${org.name}:`, teamsError.message);
      continue;
    }
    console.log(`   ${org.name}: ${teams?.length || 0} teams`);
  }

  // 3. Test: Check players are properly scoped
  console.log("\n3. Checking player isolation...");
  for (const org of orgs) {
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id, first_name, last_name, teams!inner(organization_id)")
      .eq("teams.organization_id", org.id);

    if (playersError) {
      console.error(`❌ Error fetching players for ${org.name}:`, playersError.message);
      continue;
    }
    console.log(`   ${org.name}: ${players?.length || 0} players`);
  }

  // 4. Test: Public access to organization data
  console.log("\n4. Testing public access...");
  const { error: publicError } = await supabase.from("organizations").select("name, primary_color, secondary_color");

  if (publicError) {
    console.error("❌ Public access to organizations failed:", publicError);
  } else {
    console.log("✅ Public can read organization branding data");
  }

  console.log("\n🎉 Multi-tenancy test complete!");
}

testMultiTenancy().catch(console.error);
