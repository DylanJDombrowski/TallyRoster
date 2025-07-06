// app/marketing/page.tsx

import { Container } from "@/app/components/Container";
import Link from "next/link";

// You can create these as separate components later
function HeroSection() {
  return (
    <div className="text-center py-20 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        The All-in-One Platform for Youth Sports Organizations
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Manage your teams, communicate with parents, and build your brand
        online. Spend less time on admin and more time coaching.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/pricing"
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
        >
          Choose Your Plan
        </Link>
        <Link
          href="#features"
          className="px-8 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

function FeatureHighlights() {
  // Pull these from your business plan's value proposition [cite: 405-409]
  const features = [
    {
      name: "Look Professional",
      description: "Get a website that looks as good as your top players.",
    },
    {
      name: "Save Time",
      description:
        "Stop juggling spreadsheets. Manage rosters, schedules, and more in one place.",
    },
    {
      name: "Improve Communication",
      description:
        "Keep parents, players, and coaches in the loop with centralized schedules and announcements.",
    },
  ];
  return (
    <section id="features" className="py-16 bg-slate-50">
      <Container>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {features.map((feature) => (
            <div key={feature.name}>
              <h3 className="text-xl font-bold text-slate-800">
                {feature.name}
              </h3>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SocialProof() {
  // Your business plan calls for using Miami Valley Xpress as your first beta partner and testimonial [cite: 423, 425-426]
  return (
    <section className="py-16">
      <Container>
        <div className="text-center">
          <p className="font-bold text-slate-600">
            TRUSTED BY ORGANIZATIONS LIKE YOURS
          </p>
          <div className="mt-4">
            {/* Replace with MVX Logo */}
            <p className="text-2xl font-bold text-slate-400">
              Miami Valley Xpress
            </p>
          </div>
          <blockquote className="mt-6 max-w-2xl mx-auto">
            <p className="text-lg text-slate-700">
              &quot;Sideline has transformed how we manage our organization.
              It&apos;s simple, powerful, and has saved us countless
              hours.&quot;
            </p>
            <footer className="mt-2 font-bold">- Club Director, MVX</footer>
          </blockquote>
        </div>
      </Container>
    </section>
  );
}

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <SocialProof />
      <FeatureHighlights />
      {/* You can add more sections here as you build them out */}
    </>
  );
}
