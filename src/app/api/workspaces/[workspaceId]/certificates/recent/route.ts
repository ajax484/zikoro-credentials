import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: { workspaceId: string };
  }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    const { workspaceId } = params;
    try {
      const { data, error, status } = await supabase
        .from("certificate")
        .select("*")
        .order("lastEdited", { ascending: true })
        .filter("workspaceAlias", "eq", workspaceId)
        .limit(1);

      console.log(data, "certificate");

      if (error) throw error;

      return NextResponse.json(
        { data: data[0] },
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
