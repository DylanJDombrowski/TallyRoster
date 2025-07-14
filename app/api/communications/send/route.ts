// // app/api/communications/send/route.ts
// import { createClient } from "@/lib/supabase/server";
// import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";

// const SendCommunicationSchema = z.object({
//   organizationId: z.string().uuid(),
//   subject: z.string().min(1).max(500),
//   content: z.string().min(1),
//   messageType: z.enum(["announcement", "reminder", "emergency", "update"]),
//   priority: z.enum(["low", "normal", "high", "urgent"]),

//   // Targeting options
//   targetAllOrg: z.boolean().default(false),
//   targetTeams: z.array(z.string().uuid()).optional(),
//   targetGroups: z.array(z.string().uuid()).optional(),
//   targetPlayers: z.array(z.string().uuid()).optional(),

//   // Delivery options
//   sendEmail: z.boolean().default(true),
//   sendSms: z.boolean().default(false),
//   scheduledSendAt: z.string().datetime().optional(),
// });

// export async function POST(request: NextRequest) {
//   try {
//     const supabase = createClient();
//     const body = await request.json();
//     const data = SendCommunicationSchema.parse(body);

//     // Verify user is admin/coach of organization
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (!user) {
//       return NextResponse.json(
//         { error: "Authentication required" },
//         { status: 401 }
//       );
//     }

//     const { data: userRole } = await supabase
//       .from("user_organization_roles")
//       .select("role")
//       .eq("user_id", user.id)
//       .eq("organization_id", data.organizationId)
//       .single();

//     if (!userRole || !["admin", "coach"].includes(userRole.role)) {
//       return NextResponse.json(
//         { error: "Insufficient permissions" },
//         { status: 403 }
//       );
//     }

//     // Create communication record
//     const { data: communication, error: commError } = await supabase
//       .from("communications")
//       .insert({
//         organization_id: data.organizationId,
//         sender_id: user.id,
//         subject: data.subject,
//         content: data.content,
//         message_type: data.messageType,
//         priority: data.priority,
//         send_email: data.sendEmail,
//         send_sms: data.sendSms,
//         target_all_org: data.targetAllOrg,
//         target_teams: data.targetTeams,
//         target_groups: data.targetGroups,
//         target_individuals: data.targetPlayers,
//         scheduled_send_at: data.scheduledSendAt || null,
//         sent_at: data.scheduledSendAt ? null : new Date().toISOString(),
//       })
//       .select()
//       .single();

//     if (commError) {
//       return NextResponse.json(
//         { error: "Failed to create communication" },
//         { status: 500 }
//       );
//     }

//     // If not scheduled, send immediately
//     if (!data.scheduledSendAt) {
//       await processCommunication(communication.id);
//     }

//     return NextResponse.json({
//       success: true,
//       communicationId: communication.id,
//       message: data.scheduledSendAt
//         ? "Communication scheduled"
//         : "Communication sent",
//     });
//   } catch (error) {
//     console.error("Communication send error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// // Helper function to process and send communications
// async function processCommunication(communicationId: string) {
//   const supabase = createClient();

//   // Get communication details
//   const { data: comm } = await supabase
//     .from("communications")
//     .select("*")
//     .eq("id", communicationId)
//     .single();

//   if (!comm) return;

//   // Build recipient list based on targeting
//   const recipients = await buildRecipientList(comm);

//   // Send emails via Resend
//   for (const recipient of recipients) {
//     if (comm.send_email && recipient.email) {
//       await sendEmail(comm, recipient);
//     }

//     if (comm.send_sms && recipient.phone) {
//       await sendSMS(comm, recipient);
//     }
//   }
// }

// async function buildRecipientList(communication: any) {
//   const supabase = createClient();
//   const recipients: Array<{
//     email: string;
//     phone?: string;
//     name: string;
//     type: string;
//     playerId?: string;
//   }> = [];

//   // If targeting all org
//   if (communication.target_all_org) {
//     const { data: players } = await supabase
//       .from("players")
//       .select(
//         "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email"
//       )
//       .eq("organization_id", communication.organization_id)
//       .eq("status", "active");

//     for (const player of players || []) {
//       if (player.parent_email) {
//         recipients.push({
//           email: player.parent_email,
//           phone: player.parent_phone,
//           name:
//             player.parent_name ||
//             `${player.first_name} ${player.last_name}'s Parent`,
//           type: "parent",
//           playerId: player.id,
//         });
//       }

//       if (player.player_email) {
//         recipients.push({
//           email: player.player_email,
//           name: `${player.first_name} ${player.last_name}`,
//           type: "player",
//           playerId: player.id,
//         });
//       }
//     }
//   }

//   // If targeting specific teams
//   if (communication.target_teams?.length) {
//     const { data: players } = await supabase
//       .from("players")
//       .select(
//         "id, first_name, last_name, parent_email, parent_phone, parent_name, player_email"
//       )
//       .in("team_id", communication.target_teams)
//       .eq("status", "active");

//     // Add team-specific recipients...
//   }

//   // If targeting specific groups
//   if (communication.target_groups?.length) {
//     const { data: groupMembers } = await supabase
//       .from("group_members")
//       .select("*")
//       .in("group_id", communication.target_groups)
//       .eq("active", true);

//     for (const member of groupMembers || []) {
//       recipients.push({
//         email: member.email,
//         phone: member.phone,
//         name: member.member_name,
//         type: member.member_type,
//       });
//     }
//   }

//   // Remove duplicates by email
//   const uniqueRecipients = recipients.filter(
//     (recipient, index, self) =>
//       index === self.findIndex((r) => r.email === recipient.email)
//   );

//   return uniqueRecipients;
// }

// async function sendEmail(communication: any, recipient: any) {
//   if (!process.env.RESEND_API_KEY) return;

//   try {
//     const response = await fetch("https://api.resend.com/emails", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         from: `${
//           communication.organization_name || "TallyRoster"
//         } <noreply@tallyroster.com>`,
//         to: [recipient.email],
//         subject: communication.subject,
//         html: formatEmailContent(communication, recipient),
//         reply_to: "noreply@tallyroster.com", // Could be coach's email
//       }),
//     });

//     const result = await response.json();

//     // Track delivery
//     const supabase = createClient();
//     await supabase.from("communication_deliveries").insert({
//       communication_id: communication.id,
//       recipient_email: recipient.email,
//       recipient_name: recipient.name,
//       recipient_type: recipient.type,
//       delivery_channel: "email",
//       status: response.ok ? "sent" : "failed",
//       sent_at: new Date().toISOString(),
//       external_message_id: result.id,
//       error_message: response.ok ? null : result.message,
//     });
//   } catch (error) {
//     console.error("Email send error:", error);
//     // Track failed delivery...
//   }
// }

// function formatEmailContent(communication: any, recipient: any) {
//   return `
//     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
//       <div style="background: ${
//         communication.org_primary_color || "#161659"
//       }; color: white; padding: 20px; text-align: center;">
//         <h1>${communication.organization_name || "Team Communication"}</h1>
//       </div>

//       <div style="padding: 30px 20px;">
//         <h2 style="color: #333; margin-bottom: 20px;">${
//           communication.subject
//         }</h2>

//         <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid ${
//           communication.org_primary_color || "#161659"
//         }; margin-bottom: 20px;">
//           <strong>Priority:</strong> ${communication.priority.toUpperCase()}<br>
//           <strong>Type:</strong> ${communication.message_type}
//         </div>

//         <div style="line-height: 1.6; color: #555;">
//           ${communication.content.replace(/\n/g, "<br>")}
//         </div>

//         <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

//         <p style="font-size: 12px; color: #888; text-align: center;">
//           This message was sent to ${recipient.name} via TallyRoster.<br>
//           If you have questions, please contact your team administrator.
//         </p>
//       </div>
//     </div>
//   `;
// }
