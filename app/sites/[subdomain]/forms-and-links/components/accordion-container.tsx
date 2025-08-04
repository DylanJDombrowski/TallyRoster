// app/sites/[subdomain]/forms-and-links/components/accordion-container.tsx
"use client";

import { useState } from "react";
import { Database } from "@/lib/database.types";

type OrganizationLink =
  Database["public"]["Tables"]["organization_links"]["Row"];

// Accordion Item Component
function AccordionItem({
  link,
  isExpanded,
  onToggle,
  primaryColor,
}: {
  link: OrganizationLink;
  isExpanded: boolean;
  onToggle: () => void;
  primaryColor: string;
}) {
  return (
    <div className="border border-slate-200 rounded-lg mb-4 overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-slate-50 hover:bg-slate-100 transition-colors duration-200 flex items-center justify-between group"
      >
        <h3 className="text-lg font-semibold text-slate-800 group-hover:text-slate-900">
          {link.title}
        </h3>
        <svg
          className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Accordion Content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-4 bg-white border-t border-slate-100">
          {link.description && (
            <p className="text-slate-700 mb-4 leading-relaxed">
              {link.description}
            </p>
          )}

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-md text-white font-semibold hover:opacity-90 transition-opacity duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            Access Link
            <svg
              className="ml-2 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>

          <div className="mt-3 text-xs text-slate-500">
            Opens: {new URL(link.url).hostname}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AccordionContainer({
  links,
  primaryColor,
}: {
  links: OrganizationLink[];
  primaryColor: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleAccordion = (linkId: string) => {
    setExpandedId(expandedId === linkId ? null : linkId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {links.map((link) => (
        <AccordionItem
          key={link.id}
          link={link}
          isExpanded={expandedId === link.id}
          onToggle={() => toggleAccordion(link.id)}
          primaryColor={primaryColor}
        />
      ))}
    </div>
  );
}
