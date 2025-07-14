// app/api/domains/verify/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { organizationId } = await request.json();
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get organization domain info
    const { data: org } = await supabase
      .from("organizations")
      .select("custom_domain, domain_verification_token, subdomain")
      .eq("id", organizationId)
      .single();

    if (!org?.custom_domain) {
      return NextResponse.json(
        { error: "No domain configured" },
        { status: 400 }
      );
    }

    // Verify DNS record
    const isVerified = await verifyDNSRecord(
      org.custom_domain,
      org.domain_verification_token,
      org.subdomain
    );

    if (isVerified) {
      // Update domain as verified
      await supabase
        .from("organizations")
        .update({
          domain_verified: true,
          domain_added_at: new Date().toISOString(),
        })
        .eq("id", organizationId);

      // Configure SSL (this would trigger Vercel/Cloudflare SSL setup)
      await configureDomainSSL(org.custom_domain);

      return NextResponse.json({
        success: true,
        verified: true,
        message:
          "Domain verified successfully! SSL certificate is being configured.",
      });
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: "Domain verification failed. Please check your DNS settings.",
      });
    }
  } catch (error) {
    console.error("Domain verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

// Helper Functions
async function verifyDNSRecord(
  domain: string,
  token: string | null,
  subdomain: string | null
): Promise<boolean> {
  try {
    // Check for CNAME record pointing to subdomain.tallyroster.com
    const cnameResponse = await fetch(
      `https://dns.google.com/resolve?name=${domain}&type=CNAME`
    );
    const cnameData = await cnameResponse.json();

    if (cnameData.Answer && subdomain) {
      const cnameTarget = cnameData.Answer[0]?.data?.replace(/\.$/, "");
      if (cnameTarget === `${subdomain}.tallyroster.com`) {
        return true;
      }
    }

    // Check for TXT record with verification token
    if (token) {
      const txtResponse = await fetch(
        `https://dns.google.com/resolve?name=_tallyroster-verify.${domain}&type=TXT`
      );
      const txtData = await txtResponse.json();

      if (txtData.Answer) {
        for (const record of txtData.Answer) {
          if (record.data.includes(token)) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error("DNS verification error:", error);
    return false;
  }
}

async function configureDomainSSL(domain: string): Promise<void> {
  // This would integrate with your SSL provider (Cloudflare, Let's Encrypt, etc.)
  // For now, we'll just log that SSL configuration is needed
  console.log(`🔒 Configuring SSL for domain: ${domain}`);

  // If using Vercel, SSL is automatic
  // If using Cloudflare, you'd make API calls here
  // If using Let's Encrypt, you'd trigger certificate generation
}
