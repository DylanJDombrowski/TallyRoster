// app/onboarding/page.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  sport: string | null;
  organization_type: string | null;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<"choice" | "create" | "join">("choice");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [createOrgData, setCreateOrgData] = useState({
    name: "",
    sport: "",
    organizationType: "",
    subdomain: "",
    yourRole: "admin",
  });

  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const checkUserOrganization = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user already has an organization
    const { data: userOrgRoles } = await supabase.from("user_organization_roles").select("organization_id").eq("user_id", user.id);

    if (userOrgRoles && userOrgRoles.length > 0) {
      router.push("/dashboard");
    }
  }, [supabase, router]);

  const loadOrganizations = useCallback(async () => {
    // For now, load all organizations (we'll make this more secure later)
    const { data } = await supabase.from("organizations").select("id, name, subdomain, sport, organization_type").order("name");

    setOrganizations(data || []);
  }, [supabase]);

  // Check if user already has an organization
  useEffect(() => {
    checkUserOrganization();
    loadOrganizations();
  }, [checkUserOrganization, loadOrganizations]);

  const handleCreateOrganization = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: createOrgData.name,
          organization_type: createOrgData.organizationType,
          sport: createOrgData.sport,
          subdomain: createOrgData.subdomain.toLowerCase(),
          owner_id: user.id,
          subscription_plan: "trial",
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create user-organization role
      const { error: roleError } = await supabase.from("user_organization_roles").insert({
        user_id: user.id,
        organization_id: organization.id,
        role: "admin",
      });

      if (roleError) throw roleError;

      showToast(`Organization "${organization.name}" created successfully!`, "success");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating organization:", error);
      showToast("Failed to create organization. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // For now, we'll just add them as a member
      // Later you can implement team codes or invite validation
      const { error } = await supabase.from("user_organization_roles").insert({
        user_id: user.id,
        organization_id: selectedOrgId,
        role: "member",
      });

      if (error) throw error;

      const selectedOrg = organizations.find((org) => org.id === selectedOrgId);
      showToast(`Successfully joined ${selectedOrg?.name}!`, "success");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error joining organization:", error);
      showToast("Failed to join organization. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Remove unused checkSubdomainAvailability function
  // const checkSubdomainAvailability = async (subdomain: string) => {
  //   if (subdomain.length < 3) return;
  //
  //   const { data } = await supabase
  //     .from("organizations")
  //     .select("id")
  //     .eq("subdomain", subdomain.toLowerCase())
  //     .single();
  //
  //   return !data; // Available if no data found
  // };

  if (step === "choice") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Sideline!</h1>
            <p className="text-slate-600">Let&apos;s get you set up with your team</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setStep("create")}
              className="w-full p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="font-semibold text-slate-900">Create a New Organization</div>
              <div className="text-sm text-slate-600">Start fresh with your own team or league</div>
            </button>

            <button
              onClick={() => setStep("join")}
              className="w-full p-4 border-2 border-green-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left"
            >
              <div className="font-semibold text-slate-900">Join an Existing Organization</div>
              <div className="text-sm text-slate-600">Connect with a team that&apos;s already using Sideline</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "create") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <button onClick={() => setStep("choice")} className="text-blue-600 hover:text-blue-800 mb-4">
              ← Back to options
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Organization</h2>
            <p className="text-slate-600">Set up your team or league on Sideline</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrganization();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name *</label>
              <input
                type="text"
                value={createOrgData.name}
                onChange={(e) => setCreateOrgData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Miami Valley Xpress"
                className="w-full p-3 border border-slate-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sport/Activity</label>
              <select
                value={createOrgData.sport}
                onChange={(e) => setCreateOrgData((prev) => ({ ...prev, sport: e.target.value }))}
                className="w-full p-3 border border-slate-300 rounded-lg"
              >
                <option value="">Select sport...</option>
                <option value="Baseball">Baseball</option>
                <option value="Basketball">Basketball</option>
                <option value="Football">Football</option>
                <option value="Soccer">Soccer</option>
                <option value="Softball">Softball</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Organization Type</label>
              <select
                value={createOrgData.organizationType}
                onChange={(e) => setCreateOrgData((prev) => ({ ...prev, organizationType: e.target.value }))}
                className="w-full p-3 border border-slate-300 rounded-lg"
              >
                <option value="">Select type...</option>
                <option value="Youth Sports Team">Youth Sports Team</option>
                <option value="Adult Recreation League">Adult Recreation League</option>
                <option value="High School Team">High School Team</option>
                <option value="College Team">College Team</option>
                <option value="Community Club">Community Club</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Site URL *</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={createOrgData.subdomain}
                  onChange={(e) =>
                    setCreateOrgData((prev) => ({ ...prev, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") }))
                  }
                  placeholder="yourteam"
                  className="flex-1 p-3 border border-slate-300 rounded-l-lg"
                  required
                />
                <span className="px-3 py-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-600">
                  .trysideline.com
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !createOrgData.name || !createOrgData.subdomain}
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === "join") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
          <div className="mb-6">
            <button onClick={() => setStep("choice")} className="text-blue-600 hover:text-blue-800 mb-4">
              ← Back to options
            </button>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Join an Organization</h2>
            <p className="text-slate-600">Select an existing organization to join</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleJoinOrganization();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Organization *</label>
              <select
                value={selectedOrgId}
                onChange={(e) => setSelectedOrgId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg"
                required
              >
                <option value="">Choose an organization...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} {org.sport && `(${org.sport})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Future: Team Code Input */}
            {/* 
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Team Code (optional)
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                placeholder="Enter team invitation code"
                className="w-full p-3 border border-slate-300 rounded-lg"
              />
            </div>
            */}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You&apos;ll be added as a member. An admin will need to assign you the appropriate role and team
                access.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedOrgId}
              className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining..." : "Join Organization"}
            </button>
          </form>
        </div>
      </div>
    );
  }
}
