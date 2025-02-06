import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      const payload = await req.json();
      const { data, error } = await supabase
        .from("zikoroDiscount")
        .select("*")
        .eq("discountCode", payload.discountCode)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          {
            data: error?.message,
          },
          {
            status: 400,
          }
        );
      }
      if (error) throw error;

      if (!data)
        return NextResponse.json(
          { error: "Discount code not found" },
          { status: 400 }
        );

      return NextResponse.json(
        {
          data,
        },
        {
          status: 201,
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
