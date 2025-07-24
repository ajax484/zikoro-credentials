 import { fetchMediaAction } from "@/utils/helpers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    if (req.method !== "GET") {
      return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { searchParams } = new URL(req.url);
    const organizationAlias = searchParams.get('organizationAlias')!;  
    const page = searchParams.get('page')!;  
 

    try {
        const { data, count, error } = await fetchMediaAction(organizationAlias, Number(page || 1))

        console.log('MEDIA RESPONSE: ', { data, count, error })
      return NextResponse.json({ data, count, error }, { status: 200 });
  
    } catch (error) {
      console.error("Unhandled media error:", error);
      return NextResponse.json(
        { error: "An error occurred while processing the request" },
        { status: 500 }
      );
    }
  }
  