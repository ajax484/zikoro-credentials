import { generateCloudinarySignature } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      publicId: string;
    };
  }
) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "";
    const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET || "";
    const timestamp = Math.floor(Date.now() / 1000);
    const { publicId } = params;

    const signature = generateCloudinarySignature(
      {
        public_id: "ZIKORO/" + publicId,
        timestamp: timestamp,
        api_key: apiKey,
      },
      apiSecret
    );

    console.log(apiKey, apiSecret, timestamp, signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/zikoro/image/destroy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          public_id: "ZIKORO/" + publicId,
          timestamp: timestamp.toString(),
          api_key: apiKey,
          signature: signature,
        }).toString(),
      }
    );

    const data = await response.json();

    console.log(response);

    if (!response.ok) {
      throw new Error("Failed to delete image:", data.error);
    }

    return NextResponse.json(
      {
        data: {
          msg: `Image ${publicId} deleted successfully.`,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
