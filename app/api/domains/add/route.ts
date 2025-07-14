// app/api/domains/add/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import crypto from "crypto";

const AddDomainSchema = z.object({
  organizationId: z.string().uuid(),
  domain: z
    .string()
    .min(1)
    .regex(/^[a-zA-Z0-9][a-zA-Z0-9-._]*[a-zA-Z0-9]$/, "Invalid domain format"),
});

interface SetupInstructions {
  method: string;
  steps: Array<{
    step: number;
    title: string;
    description: string;
    record: {
      type: string;
      name: string;
      value: string;
      ttl: string;
    };
    instructions: string[];
  }>;
  commonProviders: {
    godaddy: string;
    namecheap: string;
    cloudflare: string;
  };
  verification: {
    message: string;
    estimatedTime: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const body = await request.json();
    const data = AddDomainSchema.parse(body);

    // Verify user is admin of organization
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

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Clean and validate domain
    const cleanDomain = data.domain
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/$/, "");

    // Check if domain is already in use
    const { data: existingDomain } = await supabase
      .from("organizations")
      .select("id")
      .eq("custom_domain", cleanDomain)
      .single();

    if (existingDomain) {
      return NextResponse.json(
        { error: "Domain is already in use by another organization" },
        { status: 400 }
      );
    }

    // Get organization subdomain for instructions
    const { data: org } = await supabase
      .from("organizations")
      .select("subdomain")
      .eq("id", data.organizationId)
      .single();

    if (!org?.subdomain) {
      return NextResponse.json(
        { error: "Organization subdomain not found" },
        { status: 400 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Update organization with domain info
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        custom_domain: cleanDomain,
        domain_verification_token: verificationToken,
        domain_verified: false,
        domain_verification_method: "dns",
        domain_ssl_status: "pending",
      })
      .eq("id", data.organizationId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to add domain" },
        { status: 500 }
      );
    }

    // Add domain to Vercel (if configured)
    const vercelAdded = await addDomainToVercel(cleanDomain);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      verificationToken,
      verificationMethod: "dns",
      instructions: generateSetupInstructions(
        cleanDomain,
        verificationToken,
        org.subdomain
      ),
      vercelConfigured: vercelAdded,
    });
  } catch (error) {
    console.error("Add domain error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper Functions
async function addDomainToVercel(domain: string): Promise<boolean> {
  if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    console.warn("Vercel not configured, skipping domain addition");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: domain }),
      }
    );

    if (response.ok) {
      console.log(`✅ Domain ${domain} added to Vercel`);
      return true;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to add domain to Vercel:`, error);
      return false;
    }
  } catch (error) {
    console.error("Vercel domain addition error:", error);
    return false;
  }
}

function generateSetupInstructions(
  domain: string,
  token: string,
  subdomain: string
): SetupInstructions {
  return {
    method: "DNS",
    steps: [
      {
        step: 1,
        title: "Add CNAME Record",
        description:
          "Add a CNAME record pointing your domain to your TallyRoster subdomain",
        record: {
          type: "CNAME",
          name: domain.includes("www") ? "www" : "@",
          value: `${subdomain}.tallyroster.com`, // Use the actual organization subdomain
          ttl: "300 (or minimum allowed)",
        },
        instructions: [
          "Login to your domain provider (GoDaddy, Namecheap, etc.)",
          "Navigate to DNS Management or DNS Records",
          "Add a new CNAME record with the values above",
          "Save the changes",
        ],
      },
      {
        step: 2,
        title: "Add Verification Record (Optional but Recommended)",
        description: "Add a TXT record to verify domain ownership",
        record: {
          type: "TXT",
          name: `_tallyroster-verify.${domain}`,
          value: token,
          ttl: "300",
        },
        instructions: [
          "Add a new TXT record with the values above",
          "This helps us verify you own the domain",
        ],
      },
    ],
    commonProviders: {
      godaddy: "https://www.godaddy.com/help/add-a-cname-record-19236",
      namecheap:
        "https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/",
      cloudflare:
        "https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/",
    },
    verification: {
      message:
        "After adding the DNS records, click 'Verify Domain' below. DNS changes can take up to 24 hours to propagate.",
      estimatedTime: "5-30 minutes (can take up to 24 hours)",
    },
  };
}
