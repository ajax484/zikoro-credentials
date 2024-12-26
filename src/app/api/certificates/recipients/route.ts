import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data, error } = await supabase
        .from("certificateRecipients")
        .select("*");

      console.log(data, "recipients");

      if (error) {
        throw error;
      }

      return NextResponse.json(
        { data },
        {
          status: 200,
        }
      );
    } catch (error) {
      return NextResponse.json(
        {
          error: "Failed to fetch recipients",
        },
        {
          status: 500,
        }
      );
    }
  } else {
    return NextResponse.json(
      {
        error: "Method not allowed",
      },
      {
        status: 405,
      }
    );
  }
}
