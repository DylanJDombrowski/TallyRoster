// app/types/onboarding.ts

export interface OrganizationFormData extends Record<string, unknown> {
  organizationName: string;
  organizationType: string;
  sport: string;
  subdomain: string;
  yourRole: string;
}

export interface VisualCustomizationData extends Record<string, unknown> {
  primaryColor: string;
  secondaryColor: string;
  logo: File | null;
  logoPreview?: string | null;
}

export interface PlanSelectionData extends Record<string, unknown> {
  selectedPlan: "starter" | "pro" | "elite";
}

export interface OnboardingWizardData extends OrganizationFormData, VisualCustomizationData, PlanSelectionData {}

export interface OnboardingStepProps {
  onNext: (data?: Record<string, unknown>) => void;
  onBack: () => void;
  data: Partial<OnboardingWizardData>;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<OnboardingStepProps>;
}

export interface SubdomainCheckResponse {
  available: boolean;
  subdomain?: string;
  error?: string;
}

export type ColorPreset = {
  name: string;
  primary: string;
  secondary: string;
};
