// app/(public)/components/Footer.tsx
import Image from "next/image";

export function Footer() {
  return (
    <footer className="font-oswald text-white py-10 px-5" style={{ backgroundColor: "var(--color-secondary)" }}>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-center items-start flex-col md:flex-row">
          {/* Column 1: Logo */}
          <div className="flex-1 md:max-w-xs flex flex-col items-center mb-8 md:mb-0 px-5">
            <Image src="/assets/logos/mvxLogo1.png" alt="MVX Logo" width={250} height={200} className="w-full max-w-[250px]" />
          </div>

          {/* Column 2: Contact Information */}
          <div className="flex-1 md:max-w-xs flex flex-col items-center mb-8 md:mb-0 px-5">
            <h2 className="text-2xl font-semibold mb-5 text-center" style={{ color: "var(--color-background, #FFFFFF)" }}>
              CONTACT US
            </h2>
            <div className="mb-4 text-center">
              <p>
                <strong>Alexis Harvey</strong>
              </p>
              <p>
                <em>President</em>
              </p>
              <a
                href="mailto:mvxpresssoftballorg@gmail.com"
                className="transition-colors duration-300 block"
                style={{ color: "var(--color-background, #FFFFFF)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-background, #FFFFFF)")}
              >
                mvxpresssoftballorg@gmail.com
              </a>
            </div>
            <div className="text-center">
              <p>
                <strong>Rodney Coffey</strong>
              </p>
              <p>
                <em>Vice President</em>
              </p>
              <a
                href="mailto:mvxpresssoftballorg@gmail.com"
                className="transition-colors duration-300 block"
                style={{ color: "var(--color-background, #FFFFFF)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-background, #FFFFFF)")}
              >
                mvxpresssoftballorg@gmail.com
              </a>
            </div>
          </div>

          {/* Column 3: Links and Social Media */}
          <div className="flex-1 md:max-w-xs flex flex-col items-center px-5">
            <h2 className="text-2xl font-semibold mb-5 text-center" style={{ color: "var(--color-background, #FFFFFF)" }}>
              XPRESS YOURSELF
            </h2>
            <div className="flex flex-col items-center gap-3 mb-5">
              <a
                href="https://www.nmdxapparel.com/shop/MVXpressTeamStore/9?page=1&limit=60&sort_by=category_order&sort_order=asc"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 text-lg"
                style={{ color: "var(--color-primary, #161659)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary, #161659)")}
              >
                <strong>NMDX Apparel</strong>
              </a>
              <a
                href="https://sideline.bsnsports.com/schools/ohio/miamisburg/miami-valley-xpress"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 text-lg"
                style={{ color: "var(--color-primary, #161659)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-primary, #161659)")}
              >
                <strong>Sideline Stores</strong>
              </a>
            </div>
            <div className="flex justify-center gap-5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl transition-colors duration-300"
                style={{ color: "var(--color-background, #FFFFFF)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-background, #FFFFFF)")}
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a
                href="https://twitter.com/XpressSoftball"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl transition-colors duration-300"
                style={{ color: "var(--color-background, #FFFFFF)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-accent, #D29C9C)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-background, #FFFFFF)")}
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>

        <div
          className="text-center mt-8 text-sm pt-5"
          style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <p>
            <strong>© 2024 Miami Valley Xpress. All Rights Reserved.</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
