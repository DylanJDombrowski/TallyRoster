// app/api/communications/send/route.ts
import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type SupabaseClient = ReturnType<typeof createClient>;

// Zod schema for validating the incoming request body
const SendCommunicationSchema = z.object({
  organizationId: z.string().uuid(),
  subject: z.string().min(1).max(500),
  content: z.string().min(1),
  messageType: z.enum(["announcement", "reminder", "emergency", "update"]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  targetAllOrg: z.boolean().default(false),
  targetTeams: z.array(z.string().uuid()).optional(),
  targetGroups: z.array(z.string().uuid()).optional(),
  targetPlayers: z.array(z.string().uuid()).optional(),
  sendEmail: z.boolean().default(true),
  sendSms: z.boolean().default(false),
  scheduledSendAt: z.string().datetime().optional(),
});

// Interface for a recipient
interface Recipient {
  email: string;
  phone?: string | null;
  name: string;
  type: string;
  playerId?: string;
}

// Extended type for a communication record, including joined organization data
type CommunicationRow = Database["public"]["Tables"]["communications"]["Row"];
interface Communication extends CommunicationRow {
  organization_name?: string;
  org_primary_color?: string;
}

// Helper function to format the HTML content of the email
function formatEmailContent(
  communication: Communication,
  recipient: Recipient
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: ${
        communication.org_primary_color || "#161659"
      }; color: white; padding: 20px; text-align: center;">
        <h1>${communication.organization_name || "Team Communication"}</h1>
      </div>
      <div style="padding: 30px 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">${
          communication.subject
        }</h2>
        <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid ${
          communication.org_primary_color || "#161659"
        }; margin-bottom: 20px;">
          <strong>Priority:</strong> ${(
            communication.priority ?? ""
          ).toUpperCase()}<br>
          <strong>Type:</strong> ${communication.message_type}
        </div>
        <div style="line-height: 1.6; color: #555;">
          ${communication.content.replace(/\n/g, "<br>")}
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          This message was sent to ${recipient.name} via TallyRoster.<br>
          If you have questions, please contact your team administrator.
        </p>
      </div>
    </div>
  `;
}

// Placeholder for future SMS functionality
async function sendSMS() {
  // SMS sending not implemented
}

// Sends a single email using Resend and logs the delivery status
async function sendEmail(
  communication: Communication,
  recipient: Recipient,
  supabase: SupabaseClient
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${
          communication.organization_name || "TallyRoster"
        } <noreply@tallyroster.com>`,
        to: [recipient.email],
        subject: communication.subject,
        html: formatEmailContent(communication, recipient),
        reply_to: "noreply@tallyroster.com",
      }),
    });

    const result = await response.json();

    await supabase.from("communication_deliveries").insert({
      communication_id: communication.id,
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      recipient_type: recipient.type,
      delivery_channel: "email",
      status: response.ok ? "sent" : "failed",
      sent_at: new Date().toISOString(),
      external_message_id: result.id,
      error_message: response.ok
        ? null
        : result.message || JSON.stringify(result),
    });

    console.log(
      `📧 Email ${response.ok ? "sent" : "failed"} to ${recipient.email}`
    );
  } catch (error) {
    console.error("Email send error:", error);
    await supabase.from("communication_deliveries").insert({
      communication_id: communication.id,
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      recipient_type: recipient.type,
      delivery_channel: "email",
      status: "failed",
      sent_at: new Date().toISOString(),
      error_message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// FIXED: Builds the list of unique recipients based on the communication's targeting options
async function buildRecipientList(
  communication: Communication,
  supabase: SupabaseClient
): Promise<Recipient[]> {
  const recipientMap = new Map<string, Recipient>();

  console.log(`[Recipient Builder] Starting for comm ID: ${communication.id}`);
  console.log(`[Recipient Builder] Targeting options:`, {
    targetAllOrg: communication.target_all_org,
    targetTeams: communication.target_teams,
  });

  if (communication.target_all_org) {
    console.log(
      `[Recipient Builder] Fetching all players for org ID: ${communication.organization_id}`
    );

    // FIXED: Enhanced query with better error handling and logging
    const { data: players, error } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email, status"
      )
      .eq("organization_id", communication.organization_id)
      .eq("status", "active");

    if (error) {
      console.error(
        "[Recipient Builder] Database error fetching all players:",
        error
      );
      throw new Error(`Database error fetching players: ${error.message}`);
    }

    console.log(
      `[Recipient Builder] Query completed. Found ${
        players?.length || 0
      } active players for organization ${communication.organization_id}`
    );

    // FIXED: Added detailed logging for each player
    for (const player of players || []) {
      console.log(
        `[Recipient Builder] Processing player: ${player.first_name} ${player.last_name} (ID: ${player.id})`
      );
      console.log(
        `[Recipient Builder] Player emails - Parent: ${player.parent_email}, Player: ${player.player_email}`
      );

      if (player.parent_email?.trim()) {
        recipientMap.set(player.parent_email, {
          email: player.parent_email,
          phone: player.parent_phone,
          name:
            player.parent_name ||
            `${player.first_name} ${player.last_name}'s Parent`,
          type: "parent",
          playerId: player.id,
        });
        console.log(`[Recipient Builder] Added parent: ${player.parent_email}`);
      }

      if (player.player_email?.trim()) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          phone: null,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
        console.log(`[Recipient Builder] Added player: ${player.player_email}`);
      }
    }
  }

  if (communication.target_teams?.length) {
    console.log(
      `[Recipient Builder] Fetching players for teams:`,
      communication.target_teams
    );

    // FIXED: Enhanced query with better error handling
    const { data: players, error } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email, team_id, status"
      )
      .in("team_id", communication.target_teams)
      .eq("status", "active");

    if (error) {
      console.error(
        "[Recipient Builder] Database error fetching team players:",
        error
      );
      throw new Error(`Database error fetching team players: ${error.message}`);
    }

    console.log(
      `[Recipient Builder] Found ${
        players?.length || 0
      } players in the specified teams.`
    );

    for (const player of players || []) {
      console.log(
        `[Recipient Builder] Processing team player: ${player.first_name} ${player.last_name} (Team: ${player.team_id})`
      );

      // FIXED: Syntax error - was missing 'player' prefix
      if (player.parent_email?.trim()) {
        recipientMap.set(player.parent_email, {
          email: player.parent_email,
          phone: player.parent_phone,
          name:
            player.parent_name ||
            `${player.first_name} ${player.last_name}'s Parent`,
          type: "parent",
          playerId: player.id,
        });
        console.log(
          `[Recipient Builder] Added team parent: ${player.parent_email}`
        );
      }

      if (player.player_email?.trim()) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          phone: null,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
        console.log(
          `[Recipient Builder] Added team player: ${player.player_email}`
        );
      }
    }
  }

  // FIXED: Added support for target individuals
  if (communication.target_individuals?.length) {
    console.log(
      `[Recipient Builder] Fetching individual players:`,
      communication.target_individuals
    );

    const { data: players, error } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email, status"
      )
      .in("id", communication.target_individuals)
      .eq("status", "active");

    if (error) {
      console.error(
        "[Recipient Builder] Database error fetching individual players:",
        error
      );
      throw new Error(
        `Database error fetching individual players: ${error.message}`
      );
    }

    console.log(
      `[Recipient Builder] Found ${players?.length || 0} individual players.`
    );

    for (const player of players || []) {
      if (player.parent_email?.trim()) {
        recipientMap.set(player.parent_email, {
          email: player.parent_email,
          phone: player.parent_phone,
          name:
            player.parent_name ||
            `${player.first_name} ${player.last_name}'s Parent`,
          type: "parent",
          playerId: player.id,
        });
      }

      if (player.player_email?.trim()) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          phone: null,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
      }
    }
  }

  const recipients = Array.from(recipientMap.values());
  console.log(
    `[Recipient Builder] Final recipient count: ${recipients.length}`
  );
  console.log(
    `[Recipient Builder] Recipients:`,
    recipients.map((r) => `${r.name} (${r.email})`)
  );

  return recipients;
}

// FIXED: Enhanced error handling and status tracking
async function processCommunication(
  communicationId: string,
  cookieStore: ReadonlyRequestCookies
) {
  const supabase = createClient(cookieStore);

  const { data: comm, error } = await supabase
    .from("communications")
    .select(`*, organizations!inner(name, primary_color)`)
    .eq("id", communicationId)
    .single();

  if (error || !comm) {
    const errorMessage = `Failed to fetch communication with ID ${communicationId}: ${
      error?.message || "Communication not found"
    }`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  const communication: Communication = {
    ...comm,
    priority: comm.priority ?? "normal",
    message_type: comm.message_type ?? "announcement",
    send_email: comm.send_email ?? true,
    send_sms: comm.send_sms ?? false,
    send_push: comm.send_push ?? false,
    target_all_org: comm.target_all_org ?? false,
    organization_name: comm.organizations?.name,
    org_primary_color: comm.organizations?.primary_color ?? undefined,
  };

  const recipients = await buildRecipientList(communication, supabase);

  console.log(
    `📧 Communication ${communication.id} is being sent to ${recipients.length} recipients.`
  );

  if (recipients.length === 0) {
    console.warn(
      `⚠️ No recipients found for communication ${communication.id}.`
    );
    throw new Error(
      "No recipients found for this communication. Please check your targeting options and ensure players have email addresses configured."
    );
  }

  // FIXED: Update communication status to 'sending'
  await supabase
    .from("communications")
    .update({
      status: "sending",
      sent_at: new Date().toISOString(),
    })
    .eq("id", communication.id);

  for (const recipient of recipients) {
    if (communication.send_email && recipient.email) {
      await sendEmail(communication, recipient, supabase);
    }
    if (communication.send_sms && recipient.phone) {
      await sendSMS();
    }
  }

  // FIXED: Update communication status to 'sent' after successful processing
  await supabase
    .from("communications")
    .update({ status: "sent" })
    .eq("id", communication.id);
}

// FIXED: Enhanced error handling in main API endpoint
export async function POST(request: NextRequest) {
  let communicationId: string | null = null;

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();
    const data = SendCommunicationSchema.parse(body);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { data: userRole } = await supabase
      .from("user_organization_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("organization_id", data.organizationId)
      .single();

    if (!userRole || !["admin", "coach"].includes(userRole.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // FIXED: Set initial status to 'processing'
    const { data: communication, error: commError } = await supabase
      .from("communications")
      .insert({
        organization_id: data.organizationId,
        sender_id: user.id,
        subject: data.subject,
        content: data.content,
        message_type: data.messageType,
        priority: data.priority,
        send_email: data.sendEmail,
        send_sms: data.sendSms,
        target_all_org: data.targetAllOrg,
        target_teams: data.targetTeams,
        target_groups: data.targetGroups,
        target_individuals: data.targetPlayers,
        scheduled_send_at: data.scheduledSendAt || null,
        status: data.scheduledSendAt ? "scheduled" : "processing",
      })
      .select()
      .single();

    if (commError) {
      console.error("Communication creation error:", commError);
      return NextResponse.json(
        { error: "Failed to create communication" },
        { status: 500 }
      );
    }

    communicationId = communication.id;

    if (!data.scheduledSendAt) {
      try {
        await processCommunication(communication.id, cookieStore);
      } catch (processingError) {
        console.error(
          `Critical communication processing failure for ID ${communicationId}:`,
          processingError
        );

        // FIXED: Update communication status to 'failed' and add error message
        try {
          await supabase
            .from("communications")
            .update({
              status: "failed",
              error_message:
                processingError instanceof Error
                  ? processingError.message
                  : "Unknown processing error",
            })
            .eq("id", communicationId);
        } catch (updateError) {
          console.error(
            "Failed to update communication status after processing error:",
            updateError
          );
        }

        return NextResponse.json(
          {
            error: "Failed to process communication",
            details:
              processingError instanceof Error
                ? processingError.message
                : "Unknown processing error",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      communicationId: communication.id,
      message: data.scheduledSendAt
        ? "Communication scheduled"
        : "Communication sent",
    });
  } catch (error) {
    console.error("Top-level communication send error:", error);

    // FIXED: Update communication status to 'failed' if we have a communication ID
    if (communicationId) {
      try {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        await supabase
          .from("communications")
          .update({
            status: "failed",
            error_message:
              error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", communicationId);
      } catch (updateError) {
        console.error("Failed to update communication status:", updateError);
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
