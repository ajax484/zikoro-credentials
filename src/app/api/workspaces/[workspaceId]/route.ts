import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "POST") {
    try {
      const { workspaceId } = params;
      console.log(workspaceId);
      //
      const payload = await req.json();

      const { data, error } = await supabase
        .from("organization")
        .update(payload)
        .eq("id", workspaceId)
        .select(
          "*, verification:organizationVerification(*), role:organizationTeamMembers_Credentials(userRole)"
        )
        .maybeSingle();

      console.log(data);

      if (error) throw error;
      return NextResponse.json(
        { data, msg: "organization updated successfully" },
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
          status: 400,
        }
      );
    }
  } else {
    return NextResponse.json(
      { error: "Method not allowed" },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "PATCH") {
    try {
      const params = await req.json();

      const { data, error } = await supabase
        .from("organization")
        .update(params)
        .eq("organizationAlias", workspaceId)
        .select(
          "*, verification:organizationVerification(*), role:organizationTeamMembers_Credentials(userRole)"
        )
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json(
        { msg: "workspace updated successfully", data },
        {
          status: 200,
        }
      );
    } catch (error) {
      console.error(error, "patch");
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

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: number } }
) {
  const { workspaceId } = params;
  console.log(workspaceId);
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      const { data, error, status } = await supabase
        .from("organization")
        .select(
          "*, verification:organizationVerification(*), role:organizationTeamMembers_Credentials(userRole)"
        )
        .eq("id", workspaceId)
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json(
        {
          data,
        },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workspaceId: number } }
) {
  const { workspaceId } = params;
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "DELETE") {
    try {
      const { data, error } = await supabase
        .from("organization")
        .delete()
        .eq("id", workspaceId);

      if (error) throw error;
      return NextResponse.json(
        { data, msg: "organization deleted successfully" },
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

export const dynamic = "force-dynamic";
