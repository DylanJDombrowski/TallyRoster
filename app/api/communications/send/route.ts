// app/api/communications/send/route.ts
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

  // Targeting options
  targetAllOrg: z.boolean().default(false),
  targetTeams: z.array(z.string().uuid()).optional(),
  targetGroups: z.array(z.string().uuid()).optional(),
  targetPlayers: z.array(z.string().uuid()).optional(),

  // Delivery options
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

// Use the database type as base and extend it
type CommunicationRow = Database["public"]["Tables"]["communications"]["Row"];

interface Communication extends CommunicationRow {
  // Additional fields that might come from organization join
  organization_name?: string;
  org_primary_color?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();
    const data = SendCommunicationSchema.parse(body);

    // Verify user is admin/coach of organization
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

    // Create communication record
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
        sent_at: data.scheduledSendAt ? null : new Date().toISOString(),
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

    // If not scheduled, send immediately
    if (!data.scheduledSendAt) {
      try {
        await processCommunication(communication.id, cookieStore);

        // Update status to 'sent' after successful processing
        await supabase
          .from("communications")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", communication.id);
      } catch (processingError) {
        console.error(
          "Critical communication processing failure:",
          processingError
        );

        // Update communication status to 'failed' for data integrity
        try {
          await supabase
            .from("communications")
            .update({
              sent_at: null,
              // Note: You may want to add a status field to your communications table
              // status: 'failed'
            })
            .eq("id", communication.id);
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
    console.error("Communication send error:", error);
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

// Helper function to process and send communications
async function processCommunication(
  communicationId: string,
  cookieStore: ReadonlyRequestCookies
) {
  const supabase = createClient(cookieStore);

  // Get communication details with organization info
  const { data: comm, error } = await supabase
    .from("communications")
    .select(
      `
      *,
      organizations!inner(
        name,
        primary_color
      )
    `
    )
    .eq("id", communicationId)
    .single();

  if (error || !comm) {
    const errorMessage = `Failed to fetch communication with ID ${communicationId}: ${
      error?.message || "Communication not found"
    }`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Flatten organization data with proper null handling
  const communication: Communication = {
    ...comm,
    priority: comm.priority ?? "",
    message_type: comm.message_type ?? "",
    send_email: comm.send_email ?? true,
    send_sms: comm.send_sms ?? false,
    send_push: comm.send_push ?? false,
    target_all_org: comm.target_all_org ?? false,
    organization_name: comm.organizations?.name,
    org_primary_color: comm.organizations?.primary_color ?? undefined,
  };

  // Build recipient list based on targeting
  const recipients = await buildRecipientList(communication, supabase);

  console.log(`📧 Sending to ${recipients.length} recipients`);

  // Send emails via Resend
  for (const recipient of recipients) {
    if (communication.send_email && recipient.email) {
      await sendEmail(communication, recipient, supabase);
    }

    if (communication.send_sms && recipient.phone) {
      await sendSMS(communication, recipient, supabase);
    }
  }
}

async function buildRecipientList(
  communication: Communication,
  supabase: SupabaseClient
): Promise<Recipient[]> {
  const recipientMap = new Map<string, Recipient>(); // Use Map to efficiently handle duplicates

  // If targeting all org
  if (communication.target_all_org) {
    const { data: players } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email"
      )
      .eq("organization_id", communication.organization_id)
      .eq("status", "active");

    for (const player of players || []) {
      if (player.parent_email) {
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

      if (player.player_email) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
      }
    }
  }

  // If targeting specific teams
  if (communication.target_teams?.length) {
    const { data: players } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email"
      )
      .in("team_id", communication.target_teams)
      .eq("status", "active");

    for (const player of players || []) {
      if (player.parent_email) {
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

      if (player.player_email) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
      }
    }
  }

  // If targeting specific groups (when you implement groups)
  if (communication.target_groups?.length) {
    const { data: groupMembers } = await supabase
      .from("group_members")
      .select("*")
      .in("group_id", communication.target_groups)
      .eq("active", true);

    for (const member of groupMembers || []) {
      if (member.email) {
        recipientMap.set(member.email, {
          email: member.email,
          phone: member.phone,
          name: member.member_name ?? "Unknown Member",
          type: member.member_type,
        });
      }
    }
  }

  // If targeting specific players
  if (communication.target_individuals?.length) {
    const { data: players } = await supabase
      .from("players")
      .select(
        "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email"
      )
      .in("id", communication.target_individuals)
      .eq("status", "active");

    for (const player of players || []) {
      if (player.parent_email) {
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

      if (player.player_email) {
        recipientMap.set(player.player_email, {
          email: player.player_email,
          name: `${player.first_name} ${player.last_name}`,
          type: "player",
          playerId: player.id,
        });
      }
    }
  }

  // Convert Map values to array - this automatically handles duplicates
  return Array.from(recipientMap.values());
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

    // Track delivery
    await supabase.from("communication_deliveries").insert({
      communication_id: communication.id,
      recipient_email: recipient.email,
      recipient_name: recipient.name,
      recipient_type: recipient.type,
      delivery_channel: "email",
      status: response.ok ? "sent" : "failed",
      sent_at: new Date().toISOString(),
      external_message_id: result.id,
      error_message: response.ok ? null : result.message,
    });

    console.log(
      `📧 Email ${response.ok ? "sent" : "failed"} to ${recipient.email}`
    );
  } catch (error) {
    console.error("Email send error:", error);

    // Track failed delivery
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

async function sendSMS(
  communication: Communication,
  recipient: Recipient,
  supabase: SupabaseClient
) {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("AWS credentials not configured, skipping SMS send");
    return;
  }

  // TODO: Implement AWS SNS SMS sending
  console.log(
    `📱 SMS would be sent to ${recipient.phone} (not implemented yet)`
  );

  // Track delivery placeholder
  await supabase.from("communication_deliveries").insert({
    communication_id: communication.id,
    recipient_email: recipient.email,
    recipient_name: recipient.name,
    recipient_type: recipient.type,
    delivery_channel: "sms",
    status: "pending",
    sent_at: new Date().toISOString(),
    error_message: "SMS sending not implemented yet",
  });
}

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
