// app/marketing/page.tsx

import { Container } from "@/app/components/Container";
import Link from "next/link";

function HeroSection() {
  return (
    <div className="text-center py-20 px-4 bg-gradient-to-b from-blue-50 to-white">
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight">
        The All-in-One Platform for
        <span className="text-blue-600"> Youth Sports Organizations</span>
      </h1>
      <p className="mt-6 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Stop juggling spreadsheets and group texts. Give your organization a
        professional website, streamlined communication, and powerful management
        tools. Spend less time on admin and more time coaching.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
        <Link
          href="/marketing/demo"
          className="px-8 py-4 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          Get a Free Demo
        </Link>
        <Link
          href="/signup"
          className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
        >
          Start Free Trial
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        No credit card required • Setup in minutes
      </p>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Tired of Managing Your Organization the Hard Way?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Spreadsheet Chaos
            </h3>
            <p className="text-slate-600">
              Juggling multiple Google Sheets for rosters, schedules, and
              contact info
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Communication Mess
            </h3>
            <p className="text-slate-600">
              Group texts, emails, and calls scattered everywhere. Parents
              always asking &quot;when&apos;s the next game?&quot;
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌐</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Unprofessional Online Presence
            </h3>
            <p className="text-slate-600">
              No website or a basic page that doesn&apos;t showcase your teams
              properly
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SolutionSection() {
  return (
    <section className="py-16">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Everything Your Organization Needs in One Place
          </h2>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            TallyRoster gives you a professional platform that makes running
            your organization simple and efficient.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Professional Websites
            </h3>
            <p className="text-slate-600 text-sm">
              Beautiful, custom websites that showcase your teams and players
              professionally
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Streamlined Communication
            </h3>
            <p className="text-slate-600 text-sm">
              Keep parents, players, and coaches in the loop with centralized
              announcements
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Live Score Tracking
            </h3>
            <p className="text-slate-600 text-sm">
              Real-time game updates that keep remote fans connected to the
              action
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Easy Form Management
            </h3>
            <p className="text-slate-600 text-sm">
              Handle registrations, submissions, and paperwork without the
              hassle
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

function SocialProof() {
  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center">
          <p className="font-bold text-slate-600 text-sm tracking-wide uppercase">
            TRUSTED BY ORGANIZATIONS LIKE YOURS
          </p>
          <div className="mt-8">
            <div className="bg-white p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
              <blockquote className="text-lg text-slate-700 italic mb-6">
                &quot;We hired Dylan to build our website and help form a better
                online strategy. We had been struggling to properly structure
                our data and get a handle on all the information we needed to
                share with our community. With Dylan&apos;s skill and knowledge
                about how to properly structure and build the website, we were
                not only able to get a great start on what we needed but have
                also been able to gather a robust following and get information
                out in a timely fashion.&quot;
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="font-bold text-slate-800">
                    Organization Founder
                  </p>
                  <p className="text-slate-600">Youth Sports Organization</p>
                </div>
              </div>
            </div>
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
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join forward-thinking organizations who&apos;ve already made the
            switch to TallyRoster.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/marketing/demo"
              className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              Schedule a Demo
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-lg hover:bg-blue-400 transition-colors border-2 border-blue-400"
            >
              Start Your Free Trial
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <SocialProof />
      <CTASection />
    </>
  );
}
