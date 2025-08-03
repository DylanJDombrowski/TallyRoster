// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TallyRoster Test <noreply@tallyroster.com>",
        to: [email],
        subject: "TallyRoster Email Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #161659; color: white; padding: 20px; text-align: center;">
              <h1>TallyRoster Email Test</h1>
            </div>
            <div style="padding: 30px 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Email Service Working! ✅</h2>
              <p style="color: #555; line-height: 1.6;">
                This is a test email to verify that the TallyRoster email service is working correctly.
              </p>
              <p style="color: #555; line-height: 1.6;">
                If you received this email, it means:
              </p>
              <ul style="color: #555; line-height: 1.6;">
                <li>Your Resend API key is configured properly</li>
                <li>The email service is functioning</li>
                <li>You can now send communications to parents and coaches</li>
              </ul>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #888; text-align: center;">
                This is a test message from TallyRoster.<br>
                Sent at ${new Date().toLocaleString()}
              </p>
            </div>
          </div>
        `,
        reply_to: "noreply@tallyroster.com",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Email send failed",
          details: result.message || JSON.stringify(result),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
      messageId: result.id,
    });
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
