// app/marketing/contact/page.tsx

import { Container } from "@/app/components/Container";

function HeroSection() {
  return (
    <div className="text-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
        Get in Touch
      </h1>
      <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
        Have questions? Want to learn more? We&apos;d love to hear from you and
        help your organization succeed.
      </p>
    </div>
  );
}

function ContactOptions() {
  return (
    <section className="py-16">
      <Container>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Schedule a Call
            </h3>
            <p className="text-slate-600 mb-4">
              Book a time that works for you and let&apos;s discuss your needs
            </p>
            <a
              href="/marketing/demo"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Schedule Demo →
            </a>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✉️</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Send an Email
            </h3>
            <p className="text-slate-600 mb-4">
              Drop us a line and we&apos;ll get back to you quickly
            </p>
            <a
              href="mailto:hello@tallyroster.com"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              hello@tallyroster.com
            </a>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">
              Quick Questions
            </h3>
            <p className="text-slate-600 mb-4">
              Use the form below for quick questions or feedback
            </p>
            <a
              href="#contact-form"
              className="text-blue-600 font-semibold hover:text-blue-700"
            >
              Contact Form →
            </a>
          </div>
        </div>

        <div id="contact-form" className="max-w-2xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Send us a Message
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
                  htmlFor="organization"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Organization Name
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subject</option>
                  <option value="demo">Request a Demo</option>
                  <option value="pricing">Pricing Questions</option>
                  <option value="features">Feature Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us more about your organization and how we can help..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "How quickly can we get set up?",
      answer:
        "Most organizations are up and running within 24-48 hours. We handle the technical setup while you focus on uploading your content.",
    },
    {
      question: "Do you offer training for our staff?",
      answer:
        "Absolutely! We provide personalized training sessions to ensure your team is comfortable using all of TallyRoster's features.",
    },
    {
      question: "Can we migrate our existing data?",
      answer:
        "Yes, we can help you import your existing rosters, schedules, and other data. We support CSV imports and can assist with data migration.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer email support, scheduled calls, and comprehensive documentation. Our goal is to ensure you're successful with the platform.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50">
      <Container>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export default function ContactPage() {
  return (
    <>
      <HeroSection />
      <ContactOptions />
      <FAQSection />
    </>
  );
}
