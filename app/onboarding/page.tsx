// app/onboarding/page.tsx
"use client";

import { OnboardingWizard } from "@/app/components/onboarding/OnboardingWizard";
import { OrganizationSetupStep } from "@/app/components/onboarding/steps/OrganizationSetupStep";
import { VisualCustomizationStep } from "@/app/components/onboarding/steps/VisualCustomizationStep";
import { useToast } from "@/app/components/toast-provider";
import { OnboardingStepProps, OnboardingWizardData } from "@/app/types/onboarding";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Site Preview Step Component
function SitePreviewStep({ onNext, onBack, data }: OnboardingStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">🎉 Your Site is Ready!</h3>
        <p className="text-slate-600">Here&apos;s what your team website will look like with real content...</p>
      </div>

      {/* Live Preview Mock */}
      <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
        <div
          className="h-32 flex items-center justify-center text-white"
          style={{
            background: `linear-gradient(135deg, ${data.primaryColor || "#1e40af"} 0%, ${data.secondaryColor || "#3b82f6"} 100%)`,
          }}
        >
          <div className="text-center">
            {data.logoPreview && <Image src={data.logoPreview} alt="Logo" width={64} height={64} className="mx-auto mb-2 object-contain" />}
            <h1 className="text-2xl font-bold">{data.organizationName || "Your Team"}</h1>
            <p className="opacity-90">{data.sport || "Sport"} • Season 2025</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Latest News</h4>
              <p className="text-sm text-slate-600">Game highlights, team updates, and announcements</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Team Roster</h4>
              <p className="text-sm text-slate-600">Player profiles, stats, and contact info</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Schedule</h4>
              <p className="text-sm text-slate-600">Upcoming games and practice times</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Parent Portal</h4>
              <p className="text-sm text-slate-600">Private access for team families</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-slate-600 mb-4">
          Your site will be available at: <strong>{data.subdomain || "yourteam"}.trysideline.com</strong>
        </p>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors">
          Back
        </button>
        <button
          onClick={() => onNext()}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Choose Your Plan
        </button>
      </div>
    </div>
  );
}

// Plan Selection Step Component
function PlanSelectionStep({ onNext, onBack }: OnboardingStepProps) {
  const plans = [
    {
      name: "starter" as const,
      displayName: "Starter",
      price: 49,
      description: "Perfect for getting started",
      features: ["Custom Domain", "Team & Roster Management", "Schedule Management", "Dynamic Theming"],
      recommended: false,
    },
    {
      name: "pro" as const,
      displayName: "Pro",
      price: 99,
      description: "Most popular for growing teams",
      features: [
        "Everything in Starter",
        "CSV Data Import",
        "Player Statistics",
        "Blog / News Section",
        "Parent & Player Portals",
        "Priority Support",
      ],
      recommended: true,
    },
    {
      name: "elite" as const,
      displayName: "Elite",
      price: 199,
      description: "For large organizations",
      features: [
        "Everything in Pro",
        "Online Registration & Payments",
        "Photo & Video Galleries",
        "Dedicated Support",
        "Advanced Analytics",
      ],
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Plan</h3>
        <p className="text-slate-600">Start your 14-day free trial • No credit card required</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
              plan.recommended ? "border-blue-500 ring-2 ring-blue-500 ring-opacity-20" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Most Popular</span>
              </div>
            )}

            <div className="text-center mb-6">
              <h4 className="text-xl font-bold text-slate-900 mb-2">{plan.displayName}</h4>
              <div className="mb-2">
                <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                <span className="text-slate-600">/month</span>
              </div>
              <p className="text-sm text-slate-600">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => onNext({ selectedPlan: plan.name })}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                plan.recommended ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-100 text-slate-900 hover:bg-slate-200"
              }`}
            >
              Start Free Trial
            </button>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-slate-600">
        <p>All plans include a 14-day free trial. Cancel anytime.</p>
      </div>

      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors">
          Back
        </button>
      </div>
    </div>
  );
}

// Onboarding Steps Configuration
const ONBOARDING_STEPS = [
  {
    id: "organization",
    title: "Organization",
    description: "Tell us about your team and choose your site URL",
    component: OrganizationSetupStep,
  },
  {
    id: "customize",
    title: "Customize",
    description: "Upload your logo and choose your team colors",
    component: VisualCustomizationStep,
  },
  {
    id: "preview",
    title: "Preview",
    description: "See how your site will look with real content",
    component: SitePreviewStep,
  },
  {
    id: "plan",
    title: "Plan",
    description: "Choose the plan that works best for your team",
    component: PlanSelectionStep,
  },
];

// Main Onboarding Page Component
export default function OnboardingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOnboardingComplete = async (allData: OnboardingWizardData): Promise<void> => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to complete onboarding");
      }

      showToast(`Welcome to Sideline! Your organization "${result.organization.name}" has been created.`, "success");

      // If there's a Stripe checkout URL, redirect there
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        // Otherwise, go to dashboard with a trial banner
        router.push(result.dashboardUrl);
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      showToast(error instanceof Error ? error.message : "Error setting up your account. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <OnboardingWizard steps={ONBOARDING_STEPS} onComplete={handleOnboardingComplete} />;
}
