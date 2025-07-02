// app/(public)/extended-team/page.tsx
import Image from "next/image";

interface Partner {
  name: string;
  description: string;
  website: string;
  logo: string;
}

const partners: Partner[] = [
  {
    name: "Miami Valley Sports Foundation",
    description: `Miami Valley Xpress could not be what it is today if it were not for its founding members and the assistance of the Miami Valley Sports Foundation. The organization is over 25+ years old today and while it has had different leadership in the legacy of the program the Miami Valley Sports Foundation and its members have continued to advocate for competitive youth softball.`,
    website: "https://miamivalleysportsfoundation.org",
    logo: "/assets/logos/mvsf-logo.jpg",
  },
  {
    name: "West Carrollton City Schools",
    description: `The West Carrollton High School field and surrounding softball complex have long been home to the Miami Valley Xpress Softball program through our partnership with West Carrollton City Schools. These fields are where the organization was founded, and has continued to develop over its storied 25+ year history. Xpress teams are fortunate to call this complex home today and because of the continued support of the West Carrollton City Schools and our long standing relationship we are able to secure the program's future for the foreseeable future.`,
    website: "https://www.westcarrolltonschools.com",
    logo: "/assets/logos/wccs-logo.png",
  },
  {
    name: "Homefield Instruction",
    description: `We are proud to be in another year of our partnership with Home Field Instruction in Franklin, OH. This partnership has given us the opportunity to have an indoor home for our whole organization. The additional training opportunities this has given our organization and our athletes has been incredible. This has afforded us valuable organizational time having a home site for organizational events like our annual Hit-A-Thon and Hitting Gauntlets, as well as valuable individual player development time in the form of our winter open gyms. The facility is perfectly suited and equipped for our needs and we could not have better partners than the owners at Home Field.`,
    website: "https://www.homefieldfranklin.com",
    logo: "/assets/logos/homefield-logo.jpg",
  },
  {
    name: "Nomadx",
    description: `Look great, play great! For the last 5 years our organization has focused on consolidating our brand and ensuring our teams hit the field looking great. This includes having uniforms that will last the course of a demanding season, and keeping our fanbase looking great no matter which of the 4 seasons we are playing in. Over that time Amanda Poteet and her Nomadx organization have been our go to partner. Paired with quality uniforms and apparel has come a personalized service that ensures things are done properly and delivered on time. Her services have also included artwork design for logos, uniforms, etc. We are fortunate to have a provider as flexible and efficient as Nomadx.`,
    website: "https://nomadx.com",
    logo: "/assets/logos/nomadx-logo.webp",
  },
];

const PartnerSection = ({ partner, index }: { partner: Partner; index: number }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 ${
      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
    }`}
  >
    <div className="flex-shrink-0">
      <div className="relative w-40 h-40">
        <Image src={partner.logo} alt={`${partner.name} Logo`} fill className="object-contain" sizes="160px" />
      </div>
    </div>
    <div className="flex-1 text-center md:text-left">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-800">{partner.name}</h2>
      <p className="text-slate-600 mb-6 leading-relaxed">{partner.description}</p>
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold"
      >
        Visit {partner.name}
      </a>
    </div>
  </div>
);

export default function ExtendedTeamPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30 py-4 shadow-md" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Our Extended Team</h1>
        </div>
      </div>

      <div className="container mx-auto py-8 md:py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {partners.map((partner, index) => (
            <PartnerSection key={partner.name} partner={partner} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
