// app/api/import/players/route.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Papa from "papaparse";
import { z } from "zod";

// Define the shape of a player record from the CSV
const PlayerCsvSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  jersey_number: z.coerce.number().optional(),
  position: z.string().optional(),
  grad_year: z.coerce.number().optional(),
});

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const teamId = formData.get("team_id") as string;
  const organizationId = formData.get("organization_id") as string;

  if (!file || !teamId || !organizationId) {
    return NextResponse.json(
      { error: "Missing file, teamId, or organizationId." },
      { status: 400 }
    );
  }

  const fileText = await file.text();

  try {
    const { data: parsedData } = Papa.parse(fileText, {
      header: true,
      skipEmptyLines: true,
    });

    const validation = z.array(PlayerCsvSchema).safeParse(parsedData);

    if (!validation.success) {
      console.error(validation.error.errors);
      return NextResponse.json(
        { error: "CSV data is invalid.", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    // Add the team_id and organization_id to each player record
    const playersToInsert = validation.data.map((player) => ({
      ...player,
      team_id: teamId,
      organization_id: organizationId, // This column must exist in your 'players' table
      status: "active", // Set a default status
    }));

    const { error } = await supabase.from("players").insert(playersToInsert);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to import players." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${playersToInsert.length} players imported successfully.`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to parse CSV file." },
      { status: 500 }
    );
  }
}
