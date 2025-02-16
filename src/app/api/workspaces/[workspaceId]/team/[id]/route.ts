import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const payload = await req.json();
    const workspaceAlias = parseInt(params.workspaceId, 10);
    const userId = parseInt(params.id, 10);

    if (isNaN(workspaceAlias) || isNaN(userId)) {
      return NextResponse.json(
        { error: "Invalid workspaceId or userId." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("organizationTeamMembers_Credentials")
      .update(payload)
      .eq("workspaceAlias", workspaceAlias)
      .eq("userId", userId);

    if (error) {
      console.error("Update Error:", error);
      throw new Error(`Failed to update team member: ${error.message}`);
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: string; id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const workspaceAlias = params.workspaceId;
    const userId = params.id;

    console.log("Deleting with:", { workspaceAlias, userId });

    const { data, error } = await supabase
      .from("organizationTeamMembers_Credentials")
      .delete()
      .eq("workspaceAlias", workspaceAlias)
      .eq("id", userId);

    if (error) {
      console.error("Delete Error:", error);
      throw new Error(`Failed to delete team member: ${error.message}`);
    }

    return NextResponse.json(
      { data, message: "Team member deleted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
