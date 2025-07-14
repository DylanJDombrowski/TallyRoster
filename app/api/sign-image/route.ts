// app/api/sign-image/route.ts - FIXED VERSION
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    console.log("🖼️ Signing Cloudinary request:", paramsToSign);

    // Ensure we have all required environment variables
    if (!process.env.CLOUDINARY_API_SECRET) {
      console.error("❌ CLOUDINARY_API_SECRET not found");
      return NextResponse.json({ error: "Cloudinary configuration missing" }, { status: 500 });
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    console.log("✅ Cloudinary signature generated");

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("❌ Error signing Cloudinary request:", error);
    return NextResponse.json({ error: "Failed to sign request" }, { status: 500 });
  }
}
