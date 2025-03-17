import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url || "");
    const searchTerm = searchParams.get("searchTerm");
    const workspaceAlias = searchParams.get("workspaceAlias");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!workspaceAlias || isNaN(page) || isNaN(limit)) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch certificate recipients with the workspace alias filter
    const { data, error, count } = await supabase
      .from("certificateRecipients")
      .select("*, certificate!inner(*)", { count: "exact" })
      .eq("certificate.workspaceAlias", workspaceAlias)
      .or(
        `recipientFirstName.ilike.%${searchTerm}%,
        recipientLastName.ilike.%${searchTerm}%,
        recipientEmail.ilike.%${searchTerm}%,
        status.ilike.%${searchTerm}%,`
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        data: {
          data,
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching certificate recipients:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipients" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
