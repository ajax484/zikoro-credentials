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
  {
    params: { workspaceId, integrationId },
  }: { params: { workspaceId: string; integrationId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "PATCH") {
    try {
      const params = await req.json();

      const { data, error } = await supabase
        .from("credentialsIntegration")
        .update(params)
        .eq("integrationAlias", integrationId)
        .select("*, certificate(*), template:recipientEmailTemplate(*)")
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json(
        { msg: "integration updated successfully", data },
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
  { params }: { params: { workspaceId: number; integrationId: string } }
) {
  const { workspaceId, integrationId } = params;
  console.log(integrationId);
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      const { data, error, status } = await supabase
        .from("credentialsIntegration")
        .select("*, certificate(*), template:recipientEmailTemplate(*)")
        .eq("integrationAlias", integrationId)
        .maybeSingle();

      console.log(data, error);

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
  { params }: { params: { workspaceId: number; integrationId: string } }
) {
  const { workspaceId, integrationId } = params;
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "DELETE") {
    try {
      const { data, error } = await supabase
        .from("credentialsIntegration")
        .delete()
        .eq("integrationAlias", integrationId);

      if (error) throw error;
      return NextResponse.json(
        { data, msg: "integration deleted successfully" },
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
