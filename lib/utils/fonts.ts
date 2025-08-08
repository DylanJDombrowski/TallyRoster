export function getFontClassName(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    Inter: "font-inter",
    Roboto: "font-roboto",
    Poppins: "font-poppins",
    Montserrat: "font-montserrat",
    "Playfair Display": "font-playfair",
    Lora: "font-lora",
    Raleway: "font-raleway",
    Oswald: "font-oswald",
  };

  return fontMap[fontFamily] || "font-inter";
}
