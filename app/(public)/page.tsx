// app/(public)/page.tsx
import { Container } from "./components/Container";
import { ImageCarousel } from "./components/ImageCarousel";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Full-screen video background */}
      <div className="relative h-screen overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
          <source src="/videos/MVX-HomePage.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}></div>
        {/* Optional: Add hero content over the video */}
        {/* 
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Miami Valley Xpress</h1>
            <p className="text-xl md:text-2xl">Champions on the diamond, friends for life.</p>
          </div>
        </div>
        */}
      </div>

      {/* Main content sections */}
      <div className="bg-white">
        {/* Indoor Facility Section */}
        <section className="py-8">
          <Container>
            <div className="text-center">
              <h2 className="font-oswald text-3xl font-bold mb-4" style={{ color: "var(--color-primary, #161659)" }}>
                Xpress Indoor Facility and Training Partner
              </h2>
              <p className="text-slate-800 max-w-4xl mx-auto">
                We are proud to announce our indoor facility and training partnership with Home Field Instruction in Franklin, OH for the
                2023-24 season.
              </p>
            </div>
          </Container>
        </section>

        {/* Image Carousel Section */}
        <section className="py-8">
          <Container>
            <ImageCarousel />
          </Container>
        </section>

        {/* Google Maps Section */}
        <section className="py-8">
          <Container>
            <div className="text-center mb-6">
              <h2 className="font-oswald text-3xl font-bold" style={{ color: "var(--color-primary, #161659)" }}>
                Our Home Field
              </h2>
            </div>
            <div className="w-full overflow-hidden rounded-lg shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3068.2302191131673!2d-84.14650732339793!3d39.717289771540336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88408f234ff151a3%3A0x7e3533a5fbaba8e7!2s5995%20Student%20St%2C%20Dayton%2C%20OH%2045459%2C%20USA!5e0!3m2!1sen!2s!4v1694822345678!5m2!1sen!2s"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
