import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params: { workspaceId, inviteId } }: { params: { workspaceId: number; inviteId: string } },
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "DELETE") {
    try {
      const { data, error } = await supabase
        .from("credentialsWorkspaceInvites")
        .delete()
        .eq("id", inviteId)
        .eq("workspaceAlias", workspaceId);

      if (error) throw error;

      return NextResponse.json(
        {
          message: "Invite deleted successfully",
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: "An error occurred while deleting the invite.",
        },
        {
          status: 500,
        },
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";
