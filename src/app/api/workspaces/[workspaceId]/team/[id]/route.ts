import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  {
    params: { workspaceId, id },
  }: { params: { workspaceId: number; id: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      const payload = await req.json();

      const { data, error } = await supabase
        .from("organizationTeamMembers_Credentials")
        .update(payload)
        .eq("workspaceAlias", workspaceId)
        .eq("userId", id);

      if (error) throw error;

      return NextResponse.json(data, {
        status: 200,
      });
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
