import { generateAlias } from "@/utils/helpers";
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
      //fetch workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("organization")
        .select("*")
        .eq("organizationAlias", workspaceId)
        .maybeSingle();

      if (workspaceError) throw workspaceError;

      if (!workspace) throw new Error("Invalid workspace");

      //create directory
      const { data: directory, error: directoryError } = await supabase
        .from("credentialsDirectory")
        .insert([
          {
            organizationAlias: workspace.organizationAlias,
            directoryName: workspace.organizationName + " Directory",
            directoryAlias: generateAlias(),
          },
        ]);

      if (directoryError) throw directoryError;

      console.log(directory);

      return NextResponse.json(
        {
          data: directory,
          message: "Team Invitation Sent",
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

export async function GET(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      //fetch all directories and log
      const { data: directories, error: directoryError } = await supabase
        .from("credentialsDirectory")
        .select("*")
        .range(0, 1000);

      console.log(directories);

      const { data, error } = await supabase
        .from("credentialsDirectory")
        .select("*")
        .eq("organizationAlias", workspaceId)
        .maybeSingle();

      console.log(data);

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

export const dynamic = "force-dynamic";
