import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      const payload = await req.json();

      console.log(payload);

      const { data, error } = await supabase
        .from("organizationTeamMembers_Engagements")
        .insert(payload);

      return NextResponse.json(
        {
          data,
          message: "Team migrated",
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
