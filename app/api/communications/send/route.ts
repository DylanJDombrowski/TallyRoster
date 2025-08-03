// app/api/communications/send/route.ts - IMMEDIATE FIX
// This version includes coaches and provides better error messages

import { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { type ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

type SupabaseClient = ReturnType<typeof createClient>;

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

interface Recipient {
  email: string;
  phone?: string | null;
  name: string;
  type: string;
  playerId?: string;
}

type CommunicationRow = Database["public"]["Tables"]["communications"]["Row"];
interface Communication extends CommunicationRow {
  organization_name?: string;
  org_primary_color?: string;
}

// Helper functions
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

// ENHANCED: Now includes coaches and provides detailed feedback
async function buildRecipientList(
  communication: Communication,
  supabase: SupabaseClient
): Promise<Recipient[]> {
  const recipientMap = new Map<string, Recipient>();
  const debugInfo = {
    playersFound: 0,
    playersWithEmails: 0,
    coachesFound: 0,
    coachesWithEmails: 0,
  };

  console.log(`[Recipient Builder] Starting for comm ID: ${communication.id}`);
  console.log(`[Recipient Builder] Targeting options:`, {
    targetAllOrg: communication.target_all_org,
    targetTeams: communication.target_teams,
  });

  if (communication.target_all_org) {
    console.log(
      `[Recipient Builder] Fetching ALL recipients for org: ${communication.organization_id}`
    );

    // Fetch all players
    const { data: players, error: playerError } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email, status"
      )
      .eq("organization_id", communication.organization_id)
      .eq("status", "active");

    if (playerError) {
      console.error("[Recipient Builder] Error fetching players:", playerError);
    } else {
      debugInfo.playersFound = players?.length || 0;
      console.log(
        `[Recipient Builder] Found ${debugInfo.playersFound} active players`
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
          debugInfo.playersWithEmails++;
        }

        if (player.player_email?.trim()) {
          recipientMap.set(player.player_email, {
            email: player.player_email,
            phone: null,
            name: `${player.first_name} ${player.last_name}`,
            type: "player",
            playerId: player.id,
          });
          debugInfo.playersWithEmails++;
        }
      }
    }

    // ENHANCED: Fetch all coaches in the organization
    const { data: allTeams } = await supabase
      .from("teams")
      .select("id")
      .eq("organization_id", communication.organization_id);

    if (allTeams?.length) {
      const { data: coaches, error: coachError } = await supabase
        .from("coaches")
        .select("id, name, email, phone, team_id")
        .in(
          "team_id",
          allTeams.map((t) => t.id)
        );

      if (coachError) {
        console.error(
          "[Recipient Builder] Error fetching coaches:",
          coachError
        );
      } else {
        debugInfo.coachesFound = coaches?.length || 0;
        console.log(
          `[Recipient Builder] Found ${debugInfo.coachesFound} coaches`
        );

        for (const coach of coaches || []) {
          if (coach.email?.trim()) {
            recipientMap.set(coach.email, {
              email: coach.email,
              phone: coach.phone,
              name: coach.name,
              type: "coach",
              playerId: undefined,
            });
            debugInfo.coachesWithEmails++;
            console.log(`[Recipient Builder] ✅ Added coach: ${coach.email}`);
          }
        }
      }
    }
  }

  if (communication.target_teams?.length) {
    console.log(
      `[Recipient Builder] Fetching recipients for teams:`,
      communication.target_teams
    );

    // Fetch players for specific teams
    const { data: players, error: playerError } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email, team_id, status"
      )
      .in("team_id", communication.target_teams)
      .eq("status", "active");

    if (!playerError && players) {
      for (const player of players) {
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

    // Fetch coaches for specific teams
    const { data: coaches, error: coachError } = await supabase
      .from("coaches")
      .select("id, name, email, phone, team_id")
      .in("team_id", communication.target_teams);

    if (!coachError && coaches) {
      for (const coach of coaches) {
        if (coach.email?.trim()) {
          recipientMap.set(coach.email, {
            email: coach.email,
            phone: coach.phone,
            name: coach.name,
            type: "coach",
            playerId: undefined,
          });
          console.log(
            `[Recipient Builder] ✅ Added team coach: ${coach.email}`
          );
        }
      }
    }
  }

  const recipients = Array.from(recipientMap.values());

  // ENHANCED: Detailed logging for debugging
  console.log(`[Recipient Builder] SUMMARY:`);
  console.log(`[Recipient Builder] - Players found: ${debugInfo.playersFound}`);
  console.log(
    `[Recipient Builder] - Players with emails: ${debugInfo.playersWithEmails}`
  );
  console.log(`[Recipient Builder] - Coaches found: ${debugInfo.coachesFound}`);
  console.log(
    `[Recipient Builder] - Coaches with emails: ${debugInfo.coachesWithEmails}`
  );
  console.log(
    `[Recipient Builder] - Total unique recipients: ${recipients.length}`
  );
  console.log(
    `[Recipient Builder] - Recipients by type:`,
    recipients.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  );

  return recipients;
}

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
    // ENHANCED: Provide specific guidance on what to do
    const errorMessage = `No recipients found for this communication. This usually means:
    
    1. Players don't have email addresses configured in their profiles
    2. No coaches have been added to teams with email addresses
    3. The targeting options selected don't match any records with email addresses
    
    To fix this:
    - Add email addresses to player profiles (parent_email or player_email fields)
    - Add coaches to teams with email addresses
    - Verify your targeting options (All Organization vs Specific Teams)`;

    console.warn(`⚠️ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  // Update status to 'sending'
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
  }

  // Update status to 'sent'
  await supabase
    .from("communications")
    .update({ status: "sent" })
    .eq("id", communication.id);
}

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

        // Update status to 'failed'
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
          console.error("Failed to update communication status:", updateError);
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
