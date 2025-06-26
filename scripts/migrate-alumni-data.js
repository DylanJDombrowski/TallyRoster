// scripts/migrate-alumni-data.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Your existing alumni data
const alumniData = [
  {
    id: "1",
    playerName: "Olivia Basil",
    xpressTeam: "Miami Valley Xpress '07 - Harvey",
    gradYear: 2025,
    position: "Pitcher",
    highSchool: "St. Ursula Academy",
    college: "Ohio Wesleyan University",
    imageUrl: "assets/teams/alumni/olivia-basil.png",
    hsLogoUrl: "assets/schools/st-ursula-academy-logo.png",
    collegeLogoUrl: "assets/schools/ohio-wesleyan-university-logo.png",
  },
  {
    id: "2",
    playerName: "Natalie Russell",
    xpressTeam: "Miami Valley Xpress 16u Harvey",
    gradYear: 2025,
    position: "2nd/Utility",
    highSchool: "Stebbins High School",
    college: "Ohio Wesleyan University",
    imageUrl: "assets/teams/defaultpfp.jpg",
    hsLogoUrl: "assets/schools/stebbins-hs-logo.png",
    collegeLogoUrl: "assets/schools/ohio-wesleyan-university-logo.png",
  },
];

async function migrateAlumniData() {
  console.log("Starting alumni data migration...");

  try {
    // Transform the data to match our database schema
    const transformedAlumni = alumniData.map((alumni) => ({
      player_name: alumni.playerName,
      xpress_team: alumni.xpressTeam,
      grad_year: alumni.gradYear,
      position: alumni.position,
      high_school: alumni.highSchool,
      college: alumni.college,
      image_url: alumni.imageUrl,
      hs_logo_url: alumni.hsLogoUrl,
      college_logo_url: alumni.collegeLogoUrl,
    }));

    // Insert the alumni data
    const { error } = await supabase.from("alumni").insert(transformedAlumni);

    if (error) {
      console.error("Error inserting alumni data:", error);
      return;
    }

    console.log(
      `Successfully migrated ${transformedAlumni.length} alumni records!`
    );
    console.log("Alumni migration complete.");
  } catch (error) {
    console.error("Alumni migration failed:", error);
  }
}

// Run the migration
migrateAlumniData();
