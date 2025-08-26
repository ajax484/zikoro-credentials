import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: NextApiRequest,
  { params: { recipientAlias } }: { params: { recipientAlias: string } }
) {
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url || "");
    const searchTerm = searchParams.get("searchTerm");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitQuery = searchParams.get("limit");

    const limit = limitQuery
      ? parseInt(searchParams.get("limit") || "10", 10)
      : null;

    // Fetch certificate recipients with the workspace alias filter
    let query = supabase
      .from("certificateRecipients")
      .select("*, certificate!inner(*)", { count: "exact" });

    console.log(recipientAlias);

    query.eq("recipientAlias", recipientAlias);

    if (searchTerm) {
      query
        .or(
          `recipientFirstName.ilike.%${searchTerm}%,recipientLastName.ilike.%${searchTerm}%,recipientEmail.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%,recipientAlias.ilike.%${searchTerm}%`
        )
        .or(`certificate(name).ilike.%${searchTerm}%`);
    }

    if (limit) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query.range(from, to);
    }

    const { data, error, count } = await query.order("created_at", {
      ascending: false,
    });

    console.log(data);

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
