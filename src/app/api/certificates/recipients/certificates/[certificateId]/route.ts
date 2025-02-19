import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: { workspaceId: string; certificateId: string };
  }
) {
  const { workspaceId: workspaceAlias } = params;
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "PATCH") {
    try {
      const { certificateId } = params;
      const payload = await req.json();

      console.log(payload);

      console.log(certificateId);

      const { data, error } = await supabase
        .from("certificateRecipients")
        .update(payload)
        .eq("certificateId", certificateId)
      .select("*");

      if (error) throw error;

      console.log(data);

      return NextResponse.json(
        {
          data,
          message: "certificate updated successfully",
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
    return NextResponse.json(
      { error: "Method not allowed" },
      {
        status: 405,
      }
    );
  }
}

export const dynamic = "force-dynamic";
