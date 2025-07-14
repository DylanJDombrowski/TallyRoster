// app/invite/[code]/page.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

interface InvitationDetails {
  organization_id: string;
  role: string;
  organizations: {
    name: string;
    sport: string | null;
    organization_type: string | null;
  };
  expires_at: string;
}

export default function InvitePage({ params }: InvitePageProps) {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const checkInvitation = useCallback(
    async (code: string) => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          // Redirect to login with return URL
          router.push(`/login?redirect=/invite/${code}`);
          return;
        }

        // Validate invitation
        const { data, error } = await supabase
          .from("organization_invitations")
          .select("*, organizations(name, sport, organization_type)")
          .eq("code", code.toUpperCase())
          .eq("used", false)
          .gt("expires_at", new Date().toISOString())
          .single();

        if (error || !data) {
          setError("This invitation is invalid or has expired.");
          return;
        }

        // Check if user is already in this organization
        const { data: existingRole } = await supabase
          .from("user_organization_roles")
          .select("id")
          .eq("user_id", user.id)
          .eq("organization_id", data.organization_id)
          .single();

        if (existingRole) {
          setError("You are already a member of this organization.");
          return;
        }

        setInvitation(data);
      } catch (err) {
        console.error("Error checking invitation:", err);
        setError("An error occurred while validating the invitation.");
      } finally {
        setLoading(false);
      }
    },
    [supabase, router]
  );

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setInviteCode(resolvedParams.code);
      await checkInvitation(resolvedParams.code);
    };
    resolveParams();
  }, [params, checkInvitation]);

  const handleJoinOrganization = async () => {
    if (!invitation) return;

    setJoining(true);
    try {
      const response = await fetch("/api/invitations/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inviteCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to join organization");
      }

      showToast(`Successfully joined ${result.organization.name}!`, "success");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error joining organization:", err);
      setError(err instanceof Error ? err.message : "Failed to join organization");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Invitation</h1>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => router.push("/dashboard")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const expiresAt = new Date(invitation.expires_at);
  const timeUntilExpiry = expiresAt.getTime() - new Date().getTime();
  const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">You&apos;ve been invited!</h1>
          <p className="text-slate-600">Join {invitation.organizations.name} on TallyRoster</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-slate-900 mb-2">Organization Details</h3>
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              <strong>Name:</strong> {invitation.organizations.name}
            </p>
            {invitation.organizations.sport && (
              <p>
                <strong>Sport:</strong> {invitation.organizations.sport}
              </p>
            )}
            {invitation.organizations.organization_type && (
              <p>
                <strong>Type:</strong> {invitation.organizations.organization_type}
              </p>
            )}
            <p>
              <strong>Your Role:</strong> <span className="capitalize">{invitation.role}</span>
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This invitation expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleJoinOrganization}
            disabled={joining}
            className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {joining ? "Joining..." : "Accept Invitation"}
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full p-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
