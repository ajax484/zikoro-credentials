import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fail } from "assert";

export async function GET(
  req: NextApiRequest,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  console.log(workspaceId);
  if (req.method !== "GET") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(req.url || "");
    const searchTerm = searchParams.get("searchTerm");
    // const workspaceAlias = searchParams.get("workspaceAlias");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limitQuery = searchParams.get("limit");

    const limit = limitQuery
      ? parseInt(searchParams.get("limit") || "10", 10)
      : null;

    if (!workspaceId || isNaN(page)) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    console.log(workspaceId);

    // Fetch certificate recipients with the workspace alias filter
    let query = supabase.from("certificate").select("*", { count: "exact" });

    if (workspaceId) query.eq("workspaceAlias", workspaceId);

    // if (searchTerm) {
    //   query = query.or(
    //     `recipientFirstName.ilike.%${searchTerm}%,recipientLastName.ilike.%${searchTerm}%,recipientEmail.ilike.%${searchTerm}%,status.ilike.%${searchTerm}%`
    //   );
    // }

    if (limit) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query.range(from, to);
    }

    if (searchTerm) {
      console.log(searchTerm);
      query.or(`name.ilike.%${searchTerm}%`);
    }

    const { data, error, count } = await query.order("created_at", {
      ascending: false,
    });

    console.log(data);

    if (error) {
      throw error;
    }

    const { data: counts, error: countError } = await supabase
      .from("certificate")
      .select(
        "id, recipientCount:certificateRecipients(count), failedRecipientCount:certificateRecipientsFailed(count)"
      )
      .in(
        "id",
        data.map((certificate) => certificate.id)
      );

    if (countError) {
      throw countError;
    }

    return NextResponse.json(
      {
        data: {
          data: data.map((certificate) => ({
            ...certificate,
            // recipientCount: certificate.recipientCount[0].count,
            // failedRecipientCount: certificate.failedRecipientCount[0].count,
            recipientCount:
              counts.find((count) => count.id === certificate.id)
                ?.recipientCount[0].count || 0,
            failedRecipientCount:
              counts.find((count) => count.id === certificate.id)
                ?.failedRecipientCount[0].count || 0,
          })),
          page,
          limit,
          total: count || 0,
          totalPages: limit ? Math.ceil((count || 0) / limit) : count,
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
