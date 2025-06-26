"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// The images are now served from the public directory
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
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-500 ease-in-out"
      />
      <div className="absolute inset-0 flex items-center justify-between p-4">
        <button onClick={prevSlide} className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
