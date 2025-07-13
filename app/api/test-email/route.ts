// app/api/test-email/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "noreply@tallyroster.com",
        to: [email],
        subject: "Test Email from TallyRoster",
        html: "<p>This is a test email to verify Resend is working!</p>",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend error:", errorText);
      return NextResponse.json({ error: `Resend error: ${errorText}` }, { status: 500 });
    }

    const result = await response.json();
    console.log("Email sent successfully:", result);

    return NextResponse.json({
      success: true,
      messageId: result.id,
      message: "Test email sent successfully!",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({ error: "Failed to send test email" }, { status: 500 });
  }
}
