// app/marketing/features/page.tsx

import { Container } from "@/app/components/Container";
import Link from "next/link";

function HeroSection() {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        Everything You Need to Run Your Organization
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        From professional websites to real-time score tracking, TallyRoster has
        all the tools youth sports organizations need to succeed.
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  benefits,
}: {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
}) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm border">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <span className="text-green-500 mr-2 mt-1">✓</span>
            <span className="text-slate-700">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturesGrid() {
  const features = [
    {
      icon: "🎨",
      title: "Professional Website Builder",
      description:
        "Create beautiful, custom websites that showcase your teams and players like the pros.",
      benefits: [
        "Custom domain and branding",
        "Team and player profile pages",
        "Photo galleries and media management",
        "Mobile-responsive design",
        "Easy drag-and-drop customization",
      ],
    },
    {
      icon: "⚡",
      title: "Live Score Tracking",
      description:
        "Keep fans engaged with real-time game updates and live scoring powered by cutting-edge technology.",
      benefits: [
        "Real-time score updates",
        "Play-by-play tracking",
        "Keep remote fans connected",
        "Easy coach and parent input",
        "Automatic game summaries",
      ],
    },
    {
      icon: "📱",
      title: "Streamlined Communication",
      description:
        "Replace group texts and scattered emails with organized, centralized communication tools.",
      benefits: [
        "Team announcements and alerts",
        "Schedule notifications",
        "Direct messaging between coaches and parents",
        "Automated reminders",
        "Emergency contact system",
      ],
    },
    {
      icon: "📝",
      title: "Smart Form Management",
      description:
        "Handle registrations, waivers, and paperwork digitally with our intuitive form builder.",
      benefits: [
        "Custom registration forms",
        "Digital signature collection",
        "Payment integration",
        "Automatic data organization",
        "Export capabilities",
      ],
    },
    {
      icon: "📊",
      title: "Team & Player Management",
      description:
        "Organize rosters, track statistics, and manage team information all in one place.",
      benefits: [
        "Easy roster management",
        "Player statistics tracking",
        "Attendance monitoring",
        "Performance analytics",
        "CSV import/export",
      ],
    },
    {
      icon: "📰",
      title: "Team Blogging Platform",
      description:
        "Share victories, updates, and team news with an integrated blogging system.",
      benefits: [
        "Coach-friendly blog editor",
        "Share game highlights and wins",
        "Photo and video integration",
        "Scheduled publishing",
        "Social media sharing",
      ],
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ComparisonSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Why Choose TallyRoster?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            See how we compare to other solutions
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                  TallyRoster
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-600">
                  Competitors
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-6 py-4 text-sm text-slate-900">
                  Professional Website Included
                </td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-red-500">
                  ✗ (Extra cost)
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-900">
                  Real-time Live Scoring
                </td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-yellow-500">
                  Limited
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-900">
                  Youth Sports Focused
                </td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-yellow-500">
                  Generic
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-900">
                  Affordable Pricing
                </td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-red-500">
                  Expensive
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-slate-900">
                  Personal Support
                </td>
                <td className="px-6 py-4 text-center text-green-500">✓</td>
                <td className="px-6 py-4 text-center text-red-500">Limited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-blue-600">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to See TallyRoster in Action?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Schedule a personalized demo and see how these features work for
            your organization.
          </p>
          <Link
            href="/marketing/demo"
            className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-gray-50 transition-colors inline-block"
          >
            Get Your Free Demo
          </Link>
        </div>
      </Container>
    </section>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
      <ComparisonSection />
      <CTASection />
    </>
  );
}
