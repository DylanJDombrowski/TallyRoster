// app/(public)/components/ImageCarousel.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const images = ["/home-carousel/Xpress.jpg", "/home-carousel/Xpress-team-pic.jpg", "/home-carousel/Xpress-org.jpg"];

export function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-lg">
      <Image
        src={images[currentIndex]}
        alt="Carousel image"
        fill
        className="object-cover transition-transform duration-500 ease-in-out"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
        priority
      />

      {/* Navigation buttons positioned like Angular version */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2 bg-black bg-opacity-50 text-white border-none cursor-pointer transition-colors hover:bg-opacity-75"
          aria-label="Previous image"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="p-2 bg-black bg-opacity-50 text-white border-none cursor-pointer transition-colors hover:bg-opacity-75"
          aria-label="Next image"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
