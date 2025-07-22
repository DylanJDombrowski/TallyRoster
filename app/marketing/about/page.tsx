// app/marketing/about/page.tsx

import { Container } from "@/app/components/Container";
import Link from "next/link";

function HeroSection() {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        Built by Someone Who Gets It
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        TallyRoster was born from real experience helping youth sports
        organizations overcome their biggest challenges with technology and
        organization.
      </p>
    </div>
  );
}

function StorySection() {
  return (
    <section className="py-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              The Problem We Solve
            </h2>
            <p className="text-slate-700 mb-6">
              Every youth sports organization faces the same challenges:
              scattered communication, outdated websites, endless spreadsheets,
              and frustrated parents asking the same questions over and over
              again. &quot;When&apos;s the next game?&quot; &quot;Where do we
              meet?&quot; &quot;Did you get my registration form?&quot;
            </p>
            <p className="text-slate-700 mb-6">
              As a developer who has worked directly with youth sports
              organizations, I&apos;ve seen these pain points firsthand.
              Organizations were spending more time managing administrative
              tasks than focusing on what really matters - coaching kids and
              building strong teams.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">
              Our Mission
            </h2>
            <p className="text-slate-700 mb-6">
              TallyRoster exists to give youth sports organizations the tools
              they need to look professional, save time, and focus on what they
              do best. We believe every organization deserves a platform
              that&apos;s as dedicated to success as they are.
            </p>

            <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">
              Why TallyRoster is Different
            </h2>
            <div className="bg-slate-50 p-6 rounded-lg mb-6">
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>
                    <strong>Built for Youth Sports:</strong> Not a generic
                    platform adapted for sports - designed specifically for
                    youth organizations from the ground up
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>
                    <strong>Real Experience:</strong> Created by someone who has
                    actually worked with youth sports organizations and
                    understands their unique needs
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>
                    <strong>Personal Support:</strong> You&apos;re not just a
                    number - you get direct access to the people building the
                    platform
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-3 mt-1">•</span>
                  <span>
                    <strong>Modern Technology:</strong> Built with cutting-edge
                    tools for reliability, speed, and real-time features like
                    live scoring
                  </span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-6 mt-12">
              Our Commitment
            </h2>
            <p className="text-slate-700 mb-6">
              We&apos;re committed to being your long-term technology partner.
              As your organization grows and evolves, TallyRoster grows with
              you. We listen to feedback, implement requested features, and
              continuously improve the platform based on real user needs.
            </p>
            <p className="text-slate-700">
              Your success is our success. When your organization runs smoothly,
              communicates effectively, and looks professional online,
              we&apos;ve done our job.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Our Values</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Partnership
            </h3>
            <p className="text-slate-600">
              We&apos;re not just a vendor - we&apos;re your technology partner,
              invested in your long-term success
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Simplicity
            </h3>
            <p className="text-slate-600">
              Complex problems deserve simple solutions. We make powerful tools
              that are easy to use
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Innovation
            </h3>
            <p className="text-slate-600">
              We use modern technology to solve old problems in new ways, like
              real-time live scoring
            </p>
          </div>
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
            Ready to Partner With Us?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Let&apos;s work together to transform how your organization
            operates.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/marketing/demo"
              className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              Schedule a Demo
            </Link>
            <Link
              href="/marketing/contact"
              className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-lg hover:bg-blue-400 transition-colors border-2 border-blue-400"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <HeroSection />
      <StorySection />
      <ValuesSection />
      <CTASection />
    </>
  );
}
