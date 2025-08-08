"use client";

import { useState } from "react";
import { CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/app/components/toast-provider";

// Define proper types
interface Organization {
  custom_domain?: string | null;
  domain_verified?: boolean | null;
  domain_verification_token?: string | null;
  subdomain?: string | null;
}

interface DomainInstruction {
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

interface DomainManagerProps {
  organization: Organization | null;
  organizationId: string;
}

export function DomainManager({
  organization,
  organizationId,
}: DomainManagerProps) {
  const [domain, setDomain] = useState(organization?.custom_domain || "");
  const [isAdding, setIsAdding] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [instructions, setInstructions] = useState<DomainInstruction | null>(
    null
  );
  const { showToast } = useToast();
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);

    try {
      const response = await fetch("/api/domains/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId, domain }),
      });

      const data = await response.json();

      if (response.ok) {
        setInstructions(data.instructions);
        showToast("Domain added! Please configure DNS records.", "success");
      } else {
        showToast(data.error || "Failed to add domain", "error");
      }
    } catch {
      showToast("An error occurred", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId }),
      });

      const data = await response.json();

      if (data.verified) {
        showToast("Domain verified successfully!", "success");
        window.location.reload();
      } else {
        showToast(
          "Domain verification failed. Please check your DNS settings.",
          "error"
        );
      }
    } catch {
      showToast("Verification error", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  if (organization?.domain_verified) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-lg font-semibold">Custom Domain Active</h2>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 mb-2">
            Your custom domain is active:
          </p>
          <p className="text-lg font-mono font-semibold text-green-900">
            {organization.custom_domain}
          </p>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h3 className="font-medium mb-2">SSL Certificate</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>SSL certificate is active and auto-renewing</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!organization?.custom_domain ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Add Custom Domain</h2>

          <form onSubmit={handleAddDomain} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain Name
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com or www.example.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your domain without http:// or https://
              </p>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isAdding ? "Adding Domain..." : "Add Domain"}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Domain Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Domain Configuration</h2>
              {organization.domain_verified ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Domain:</p>
                <p className="text-lg font-mono">
                  {organization.custom_domain}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <p className="text-sm font-medium text-yellow-600">
                  Pending DNS Configuration
                </p>
              </div>

              <button
                onClick={handleVerifyDomain}
                disabled={isVerifying}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify Domain"}
              </button>
            </div>
          </div>

          {/* DNS Instructions */}
          {instructions && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">
                DNS Configuration Instructions
              </h3>

              <div className="space-y-6">
                {instructions.steps.map((step) => (
                  <div
                    key={step.step}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <h4 className="font-medium mb-2">
                      Step {step.step}: {step.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {step.description}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Type:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                            {step.record.type}
                          </code>
                          <button
                            onClick={() => copyToClipboard(step.record.type)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Name:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                            {step.record.name}
                          </code>
                          <button
                            onClick={() => copyToClipboard(step.record.name)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Value:</span>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-200 px-2 py-1 rounded max-w-xs truncate">
                            {step.record.value}
                          </code>
                          <button
                            onClick={() => copyToClipboard(step.record.value)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Copy className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <ul className="mt-3 space-y-1">
                      {step.instructions.map(
                        (instruction: string, idx: number) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start"
                          >
                            <span className="text-blue-500 mr-2">•</span>
                            {instruction}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Provider Links */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-3">DNS Provider Guides:</h4>
                <div className="space-y-2">
                  <a
                    href={instructions.commonProviders.godaddy}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    GoDaddy Guide <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <a
                    href={instructions.commonProviders.namecheap}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Namecheap Guide <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <a
                    href={instructions.commonProviders.cloudflare}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Cloudflare Guide <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> {instructions.verification.message}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Estimated time: {instructions.verification.estimatedTime}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
