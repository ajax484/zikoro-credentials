import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { startOfDay } from "date-fns";

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
    // get other search params
    const created_at = searchParams.get("created_at");
    const cpdPoints = searchParams.get("cpdPoints");
    const cpdHours = searchParams.get("cpdHours");
    const expirationDate = searchParams.get("expirationDate");
    const label = searchParams.get("label");
    const skills = searchParams.get("skills");
    const isValid = searchParams.get("isValid");

    console.log(
      created_at,
      cpdPoints,
      cpdHours,
      expirationDate,
      label,
      skills,
      isValid
    );

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
      console.log(searchTerm);
      query
        // .or(
        //   `recipientFirstName.ilike.%${searchTerm}%,recipientLastName.ilike.%${searchTerm}%,recipientEmail.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%,recipientAlias.ilike.%${searchTerm}%`
        // )
        .or(`name.ilike.%${searchTerm}%`, {
          referencedTable: "certificate",
        });
    }

    if (created_at) {
      const date = new Date(created_at);
      console.log(date);
      const startDate = startOfDay(date).toDateString;
      const endDate = startOfDay(date).toDateString();

      console.log(startDate, endDate);
      query.gte("created_at", startDate);
      query.lte("created_at", endDate);
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
