// app/(public)/all-aboard/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

const Accordion = ({ items }: { items: AccordionItem[] }) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <button
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 text-left bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex justify-between items-center"
          >
            <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${openItems.includes(item.id) ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.includes(item.id) && <div className="px-6 py-4 border-t border-gray-200 text-slate-800">{item.content}</div>}
        </div>
      ))}
    </div>
  );
};

export default function AllAboardPage() {
  const accordionItems: AccordionItem[] = [
    {
      id: "coaches",
      title: "Hoping to Join Us?",
      content: (
        <div className="space-y-4">
          <p>Are you interested in becoming an Xpress coach for the upcoming season?</p>
          <p>Are you entertaining bringing a team aboard our organization?</p>
          <p>Please fill out the below application and a member of our Miami Valley Xpress Board will reach out to follow up.</p>
          <a
            href="https://forms.gle/eqzJs4Ymh6P9hpiJ7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            New and Returning Coaches Application
          </a>
        </div>
      ),
    },
    {
      id: "sponsors",
      title: "Hoping to Sponsor us?",
      content: (
        <div className="space-y-4">
          <p>
            Are you interested in renewing your sponsorship, or becoming a new sponsor of Miami Valley Xpress. Submit the below information
            and remit payment to the appropriate head coach, or organization head. All payments should be made out to Miami Valley Xpress.
          </p>
          <a
            href="https://forms.gle/kgxeqJ9A7v3JYGZ68"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            New and Returning Sponsors Application
          </a>
        </div>
      ),
    },
    {
      id: "financial-assistance",
      title: "Have a player needing Financial Assistance?",
      content: (
        <div className="space-y-4">
          <p>
            Our goal is to make competitive fastpitch an option for all players despite their financial situation. If you have an existing
            player that is committed to playing with Miami Valley Xpress for the upcoming season and is in need of financial assistance
            submit the below application for review of the Miami Valley Xpress board for financial aid. All applications are due by the last
            day of September for the playing year.
          </p>
          <a
            href="https://forms.gle/r1xvR2enqaAc3TbZ9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
          >
            Hardship Scholarship Application
          </a>
        </div>
      ),
    },
    {
      id: "academic-scholarship",
      title: "Have an Xpress player that would like to submit for our Academic Scholarship?",
      content: (
        <div className="space-y-4">
          <p>
            Through our generous partners at the Miami Valley Sports Foundation we are able to provide scholarship opportunities for players
            completing our programs and continuing to college. For more information on the requirements and how to submit for this honor
            please email our organization at{" "}
            <a href="mailto:mvxpresssoftballorg@gmail.com" className="text-primary hover:underline font-semibold">
              mvxpresssoftballorg@gmail.com
            </a>
            .
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 py-4 shadow-md" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">All Aboard!</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <Accordion items={accordionItems} />
            </div>
            <div className="flex items-center justify-center lg:order-last order-first">
              <div className="w-full max-w-md">
                <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src="/assets/stock/stock-img-1.jpg"
                    alt="Softball team huddle"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
