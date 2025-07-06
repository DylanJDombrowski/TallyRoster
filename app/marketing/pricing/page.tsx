// app/marketing/pricing/page.tsx

import { Container } from "@/app/components/Container";
import Link from "next/link";
import { CheckIcon } from "@heroicons/react/24/outline"; // You'll need to install @heroicons/react

// Data for the pricing tiers, based on your plans
const tiers = [
  {
    name: "Starter",
    href: "/signup?plan=starter", // Fixed: points to root-level signup
    priceMonthly: 49,
    description:
      "All the essentials to get your organization online and organized.",
    features: [
      "Custom Domain",
      "Team & Roster Management",
      "Schedule Management",
      "Dynamic Theming",
    ],
  },
  {
    name: "Pro",
    href: "/signup?plan=pro", // Fixed: points to root-level signup
    priceMonthly: 99,
    description:
      "Perfect for growing organizations that need more power and customization.",
    features: [
      "Everything in Starter, plus:",
      "CSV Data Import (Players, etc.)",
      "Player Statistics",
      'Blog / News ("On The Field")',
      "Parent & Player Portals",
      "Priority Support",
    ],
    mostPopular: true,
  },
  {
    name: "Elite",
    href: "/contact-sales?plan=elite", // Elite plans often require a sales conversation
    priceMonthly: "199+",
    description:
      "For large organizations that need advanced features and dedicated support.",
    features: [
      "Everything in Pro, plus:",
      "Online Registration & Payments",
      "Photo & Video Galleries",
      "Dedicated Support",
      "Advanced Analytics",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-slate-50">
      <Container>
        <div className="py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
              The right price for you, whoever you are
            </h1>
            <p className="mt-4 text-xl text-slate-600">
              Simple, transparent pricing that scales with your organization.
            </p>
          </div>

          <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 md:max-w-2xl md:grid-cols-2 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-3xl p-8 ring-1 xl:p-10 ${
                  tier.mostPopular ? "ring-2 ring-blue-600" : "ring-slate-200"
                } bg-white`}
              >
                <h3 className="text-lg font-semibold leading-8 text-slate-900">
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-slate-900">
                    {typeof tier.priceMonthly === "number"
                      ? `$${tier.priceMonthly}`
                      : tier.priceMonthly}
                  </span>
                  {typeof tier.priceMonthly === "number" && (
                    <span className="text-sm font-semibold leading-6 text-slate-600">
                      /month
                    </span>
                  )}
                </p>
                <Link
                  href={tier.href}
                  className={`mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-offset-2 ${
                    tier.mostPopular
                      ? "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600"
                      : "bg-white text-blue-600 ring-1 ring-inset ring-blue-200 hover:ring-blue-300 focus-visible:outline-blue-600"
                  }`}
                >
                  {tier.name === "Elite" ? "Contact Sales" : "Get started"}
                </Link>
                <ul
                  role="list"
                  className="mt-8 space-y-3 text-sm leading-6 text-slate-600 xl:mt-10"
                >
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon
                        className="h-6 w-5 flex-none text-blue-600"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
