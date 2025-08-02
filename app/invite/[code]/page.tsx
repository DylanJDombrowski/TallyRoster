// app/invite/[code]/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface InvitePageProps {
  params: Promise<{ code: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setInviteCode(resolvedParams.code);
      setLoading(false);
    };
    resolveParams();
  }, [params]);

  const handleCreateAccount = () => {
    // Redirect to signup
    router.push("/signup");
  };

  const handleLogin = () => {
    // Redirect to login with return URL
    router.push(`/login?redirect=/invite/${inviteCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            You&apos;ve been invited!
          </h1>
          <p className="text-slate-600">Join an organization on TallyRoster</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Next Step:</strong> Create your account or login to accept
            the invitation. You&apos;ll be automatically added to the
            organization once you complete the authentication process.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCreateAccount}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Account
          </button>

          <button
            onClick={handleLogin}
            className="w-full p-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
          >
            Already have an account? Login
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Invitation Code: {inviteCode}</p>
        </div>
      </div>
    </div>
  );
}
