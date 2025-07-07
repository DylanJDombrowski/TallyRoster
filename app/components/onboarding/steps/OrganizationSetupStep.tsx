// app/components/onboarding/steps/OrganizationSetupStep.tsx
"use client";

import { useToast } from "@/app/components/toast-provider";
import { OnboardingStepProps, OrganizationFormData, SubdomainCheckResponse } from "@/app/types/onboarding";
import { useState } from "react";

const ORGANIZATION_TYPES = [
  "Youth Sports Team",
  "Adult Recreation League",
  "High School Team",
  "College Team",
  "Community Club",
  "Other",
] as const;

const SPORTS = [
  "Baseball",
  "Basketball",
  "Football",
  "Soccer",
  "Softball",
  "Tennis",
  "Volleyball",
  "Hockey",
  "Swimming",
  "Track & Field",
  "Other",
] as const;

export function OrganizationSetupStep({ onNext, onBack, data }: OnboardingStepProps) {
  const [formData, setFormData] = useState<OrganizationFormData>({
    organizationName: data.organizationName || "",
    organizationType: data.organizationType || "",
    sport: data.sport || "",
    subdomain: data.subdomain || "",
    yourRole: data.yourRole || "",
  });

  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const { showToast } = useToast();

  const generateSubdomain = (orgName: string): string => {
    return orgName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .substring(0, 20);
  };

  const handleOrgNameChange = (name: string): void => {
    setFormData((prev) => ({
      ...prev,
      organizationName: name,
      subdomain: prev.subdomain || generateSubdomain(name),
    }));
  };

  const checkSubdomainAvailability = async (subdomain: string): Promise<void> => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const response = await fetch(`/api/check-subdomain?subdomain=${subdomain}`);
      const result: SubdomainCheckResponse = await response.json();
      setSubdomainAvailable(result.available);
    } catch (error) {
      console.error("Error checking subdomain:", error);
      showToast("Error checking subdomain availability", "error");
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  const handleSubdomainChange = (subdomain: string): void => {
    const cleaned = subdomain.toLowerCase().replace(/[^a-z0-9]/g, "");
    setFormData((prev) => ({ ...prev, subdomain: cleaned }));

    // Debounce the availability check
    setTimeout(() => checkSubdomainAvailability(cleaned), 500);
  };

  const handleSubmit = (): void => {
    if (!formData.organizationName.trim()) {
      showToast("Please enter your organization name", "error");
      return;
    }

    if (!formData.subdomain.trim() || formData.subdomain.length < 3) {
      showToast("Please choose a subdomain (at least 3 characters)", "error");
      return;
    }

    if (subdomainAvailable === false) {
      showToast("This subdomain is not available", "error");
      return;
    }

    onNext(formData);
  };

  return (
    <div className="space-y-6">
      {/* Organization Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Organization Name *</label>
        <input
          type="text"
          value={formData.organizationName}
          onChange={(e) => handleOrgNameChange(e.target.value)}
          placeholder="e.g., Miami Valley Xpress"
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Organization Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Organization Type</label>
        <select
          value={formData.organizationType}
          onChange={(e) => setFormData((prev) => ({ ...prev, organizationType: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select type...</option>
          {ORGANIZATION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Sport */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Sport/Activity</label>
        <select
          value={formData.sport}
          onChange={(e) => setFormData((prev) => ({ ...prev, sport: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select sport...</option>
          {SPORTS.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {/* Subdomain */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Your Site URL *</label>
        <div className="flex items-center">
          <input
            type="text"
            value={formData.subdomain}
            onChange={(e) => handleSubdomainChange(e.target.value)}
            placeholder="yourteam"
            className="flex-1 p-3 border border-slate-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="px-3 py-3 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-slate-600">.trysideline.com</span>
        </div>
        {isCheckingSubdomain && <p className="text-sm text-slate-500 mt-1">Checking availability...</p>}
        {subdomainAvailable === true && <p className="text-sm text-green-600 mt-1">✓ Available</p>}
        {subdomainAvailable === false && <p className="text-sm text-red-600 mt-1">✗ Not available</p>}
      </div>

      {/* Your Role */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Your Role</label>
        <select
          value={formData.yourRole}
          onChange={(e) => setFormData((prev) => ({ ...prev, yourRole: e.target.value }))}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select your role...</option>
          <option value="Coach">Coach</option>
          <option value="Team Manager">Team Manager</option>
          <option value="Parent">Parent</option>
          <option value="Administrator">Administrator</option>
          <option value="Player">Player</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button onClick={onBack} className="px-6 py-2 text-slate-600 hover:text-slate-800 transition-colors" disabled>
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
