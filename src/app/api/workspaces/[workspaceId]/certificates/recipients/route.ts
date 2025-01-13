import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: NextApiRequest,
  {
    params,
  }: {
    params: { workspaceId: string };
  }
) {
  if (req.method === "GET") {
    try {
      console.log("here");
      const { workspaceId: workspaceAlias } = params;
      const supabase = createRouteHandlerClient({ cookies });

      console.log(workspaceAlias);

      const { data, error, count } = await supabase
        .from("certificateRecipients")
        .select("*, certificate!inner(*)", { count: "exact" })
        .filter("certificate.workspaceAlias", "eq", workspaceAlias)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      console.log(data);

      return NextResponse.json(
        {
          data,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.log(error);
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

export const dynamic = "force-dynamic";
