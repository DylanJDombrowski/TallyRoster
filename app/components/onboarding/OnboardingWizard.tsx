// app/components/onboarding/OnboardingWizard.tsx
"use client";

import { OnboardingStep, OnboardingWizardData } from "@/app/types/onboarding";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface OnboardingWizardProps {
  steps: OnboardingStep[];
  onComplete: (allData: OnboardingWizardData) => void;
}

export function OnboardingWizard({ steps, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<OnboardingWizardData>>({});

  const handleNext = (stepData?: Partial<OnboardingWizardData>) => {
    if (stepData) {
      setWizardData((prev) => ({ ...prev, ...stepData }));
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Wizard complete
      onComplete({ ...wizardData, ...stepData } as OnboardingWizardData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Welcome to Sideline! 🎉</h1>
            <span className="text-sm text-slate-600">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex items-center space-x-2 ${index <= currentStep ? "text-blue-600" : "text-slate-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep
                      ? "bg-blue-600 text-white"
                      : index === currentStep
                      ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {index < currentStep ? "✓" : index + 1}
                </div>
                <span className="text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">{steps[currentStep].title}</h2>
                <p className="text-slate-600">{steps[currentStep].description}</p>
              </div>

              <CurrentStepComponent onNext={handleNext} onBack={handleBack} data={wizardData} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
