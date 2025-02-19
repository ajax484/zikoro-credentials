import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      console.log("here");
      const supabase = createRouteHandlerClient({ cookies });

      const { searchParams } = new URL(req.url || "");
      const workspaceAlias = searchParams.get("workspaceAlias");
      console.log(workspaceAlias);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      console.log(page, limit);

      if (isNaN(page) || isNaN(limit)) {
        console.log("invalid pagination parameters");
        return NextResponse.json(
          { error: "Invalid pagination parameters" },
          { status: 400 }
        );
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("certificateRecipients")
        .select("*, certificate!inner(*)", { count: "exact" })
        .filter("certificate.workspaceAlias", "eq", workspaceAlias)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) {
        throw error;
      }

      console.log(data);

      return NextResponse.json(
        {
          data: {
            data,
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit),
          },
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
