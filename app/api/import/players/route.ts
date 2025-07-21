// app/api/import/players/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";

// Enhanced CSV schema to match the new form fields
const PlayerCsvSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  jersey_number: z.coerce.number().int().positive().optional(),
  position: z.string().optional(),
  grad_year: z.coerce.number().int().min(2020).max(2035).optional(),
  height: z.string().optional(),
  town: z.string().optional(),
  school: z.string().optional(),
  gpa: z.coerce.number().min(0).max(4.0).optional(),
  bats: z.enum(["L", "R", "S"]).optional(),
  throws: z.enum(["L", "R"]).optional(),
  twitter_handle: z.string().optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const teamId = formData.get("team_id") as string;
    const organizationId = formData.get("organization_id") as string;

    if (!file || !teamId || !organizationId) {
      return NextResponse.json({ error: "Missing file, teamId, or organizationId." }, { status: 400 });
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "File must be a CSV file." }, { status: 400 });
    }

    const fileText = await file.text();

    // Parse CSV with better error handling
    const parseResult = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(), // Normalize headers
    });

    if (parseResult.errors && parseResult.errors.length > 0) {
      return NextResponse.json(
        {
          error: "CSV parsing failed",
          details: parseResult.errors.map((err) => err.message),
        },
        { status: 400 }
      );
    }

    // Validate data structure
    const validation = z.array(PlayerCsvSchema).safeParse(parseResult.data);

    if (!validation.success) {
      console.error("Validation errors:", validation.error.errors);

      // Format validation errors for better user feedback
      const fieldErrors = validation.error.errors.reduce((acc, err) => {
        const path = err.path.join(".");
        if (!acc[path]) acc[path] = [];
        acc[path].push(err.message);
        return acc;
      }, {} as Record<string, string[]>);

      return NextResponse.json(
        {
          error: "CSV data validation failed",
          details: fieldErrors,
          message: "Please check your CSV format and data types",
        },
        { status: 400 }
      );
    }

    // Check for duplicate jersey numbers within the import
    const jerseyNumbers = validation.data.filter((player) => player.jersey_number).map((player) => player.jersey_number);

    const duplicateJerseys = jerseyNumbers.filter((num, index) => jerseyNumbers.indexOf(num) !== index);

    if (duplicateJerseys.length > 0) {
      return NextResponse.json(
        {
          error: "Duplicate jersey numbers found in import",
          details: { duplicates: duplicateJerseys },
        },
        { status: 400 }
      );
    }

    // Check for existing jersey numbers in the team
    const { data: existingPlayers } = await supabase
      .from("players")
      .select("jersey_number")
      .eq("team_id", teamId)
      .eq("status", "active")
      .in("jersey_number", jerseyNumbers);

    if (existingPlayers && existingPlayers.length > 0) {
      const conflictingNumbers = existingPlayers.map((p) => p.jersey_number);
      return NextResponse.json(
        {
          error: "Jersey number conflicts found",
          details: {
            conflicts: conflictingNumbers,
            message: "These jersey numbers are already in use by active players on this team",
          },
        },
        { status: 409 }
      );
    }

    // Prepare players for insertion with cleaned data
    const playersToInsert = validation.data.map((player) => ({
      ...player,
      team_id: teamId,
      organization_id: organizationId,
      status: "active",
      // Clean empty strings to null for optional fields
      height: player.height?.trim() || null,
      town: player.town?.trim() || null,
      school: player.school?.trim() || null,
      twitter_handle: player.twitter_handle?.trim() || null,
      position: player.position?.trim() || null,
    }));

    // Insert players
    const { data: insertedPlayers, error: insertError } = await supabase.from("players").insert(playersToInsert).select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        {
          error: "Failed to import players to database",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedPlayers?.length || playersToInsert.length} players`,
      imported_count: insertedPlayers?.length || playersToInsert.length,
      players: insertedPlayers,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Internal server error during import",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Add GET endpoint for downloading current roster as CSV template
export async function GET(request: Request) {
  const url = new URL(request.url);
  const teamId = url.searchParams.get("team_id");
  const organizationId = url.searchParams.get("organization_id");

  if (!teamId || !organizationId) {
    return NextResponse.json({ error: "Missing team_id or organization_id parameter" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });

  try {
    // Fetch current players for the team
    const { data: players, error } = await supabase
      .from("players")
      .select(
        `
        first_name,
        last_name,
        jersey_number,
        position,
        grad_year,
        height,
        town,
        school,
        gpa,
        bats,
        throws,
        twitter_handle
      `
      )
      .eq("team_id", teamId)
      .eq("organization_id", organizationId)
      .eq("status", "active")
      .order("last_name");

    if (error) {
      return NextResponse.json({ error: "Failed to fetch players" }, { status: 500 });
    }

    // Generate CSV content
    const headers = [
      "first_name",
      "last_name",
      "jersey_number",
      "position",
      "grad_year",
      "height",
      "town",
      "school",
      "gpa",
      "bats",
      "throws",
      "twitter_handle",
    ];

    const csvContent = [
      headers.join(","),
      ...(players || []).map((player) =>
        headers
          .map((header) => {
            const value = player[header as keyof typeof player];
            return value !== null && value !== undefined ? `"${value}"` : '""';
          })
          .join(",")
      ),
    ].join("\n");

    // Return CSV file
    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="team_roster_${teamId}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export roster" }, { status: 500 });
  }
}
