// app/marketing/demo/page.tsx

import { Container } from "@/app/components/Container";

function HeroSection() {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        See TallyRoster in Action
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Get a personalized demo tailored to your organization&apos;s needs. See
        exactly how TallyRoster can transform how you manage your teams.
      </p>
    </div>
  );
}

function DemoForm() {
  return (
    <section className="py-16">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Schedule Your Free Demo
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Organization Name *
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Your Role *
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your role</option>
                  <option value="coach">Coach</option>
                  <option value="director">Club/Organization Director</option>
                  <option value="parent">Parent/Volunteer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="teamCount"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Number of Teams
                </label>
                <select
                  id="teamCount"
                  name="teamCount"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select team count</option>
                  <option value="1">1 team</option>
                  <option value="2-5">2-5 teams</option>
                  <option value="6-10">6-10 teams</option>
                  <option value="11+">11+ teams</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="sport"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Primary Sport
                </label>
                <select
                  id="sport"
                  name="sport"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select sport</option>
                  <option value="softball">Softball</option>
                  <option value="baseball">Baseball</option>
                  <option value="soccer">Soccer</option>
                  <option value="basketball">Basketball</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="challenges"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  What are your biggest challenges right now?
                </label>
                <textarea
                  id="challenges"
                  name="challenges"
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your current pain points with managing your organization..."
                />
              </div>

              <div>
                <label
                  htmlFor="timeline"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  When are you looking to make a decision?
                </label>
                <select
                  id="timeline"
                  name="timeline"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select timeline</option>
                  <option value="immediately">Immediately</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="3-months">Within 3 months</option>
                  <option value="exploring">Just exploring options</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
              >
                Schedule My Demo
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}

function WhatsIncluded() {
  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            What&apos;s Included in Your Demo
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Personalized Walkthrough
            </h3>
            <p className="text-slate-600">
              See TallyRoster configured specifically for your
              organization&apos;s needs and sport
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Custom Solutions
            </h3>
            <p className="text-slate-600">
              Get tailored recommendations for your specific challenges and
              goals
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Implementation Plan
            </h3>
            <p className="text-slate-600">
              Leave with a clear roadmap for getting your organization set up
              and running
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function DemoPage() {
  return (
    <>
      <HeroSection />
      <DemoForm />
      <WhatsIncluded />
    </>
  );
}
