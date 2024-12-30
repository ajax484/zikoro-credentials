import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userEmail = searchParams.get("userEmail");
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      const { data: credits, error } = await supabase
        .from("credentialsWorkspaceToken")
        .select("*");

      if (error) throw error;

      return NextResponse.json(
        {
          data: credits,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: "An error occurred while making the request.",
        },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";
