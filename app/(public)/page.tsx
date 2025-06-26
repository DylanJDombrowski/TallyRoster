import { ImageCarousel } from "./components/ImageCarousel";

export default function HomePage() {
  return (
    <>
      {/* Full-screen video background */}
      <div className="relative h-[calc(100vh-88px)] -mt-8 overflow-hidden">
        <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover">
          {/* The video is now served from the public directory */}
          <source src="/videos/MVX-HomePage.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        {/* You can add text or a call-to-action button over the video here */}
      </div>

      <div className="space-y-16 py-16">
        {/* Indoor Facility Section */}
        <section className="text-center">
          <h2 className="font-oswald text-3xl font-bold text-primary mb-4">Xpress Indoor Facility and Training Partner</h2>
          <p className="max-w-3xl mx-auto text-slate-800">
            We are proud to announce our indoor facility and training partnership with Home Field Instruction in Franklin, OH for the
            2023-24 season.
          </p>
        </section>

        {/* Image Carousel Section */}
        <section>
          <ImageCarousel />
        </section>

        {/* Google Maps Section */}
        <section>
          <h2 className="font-oswald text-3xl font-bold text-primary mb-4 text-center">Our Home Field</h2>
          <div className="w-full overflow-hidden rounded-lg shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3083.47959002256!2d-84.302598684635!3d39.5602179794728!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88406f3b0e1e2c9b%3A0x1d3c1d3c1d3c1d3c!2sHome%20Field%20Instruction!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </div>
    </>
  );
}
