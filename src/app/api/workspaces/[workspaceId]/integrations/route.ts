import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      const { workspaceId } = params;

      console.log(workspaceId);
      const { searchParams } = new URL(req.url || "");
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      if (isNaN(page) || isNaN(limit)) {
        console.log("invalid pagination parameters");
        return NextResponse.json(
          { error: "Invalid pagination parameters" },
          { status: 400 }
        );
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const query = supabase
        .from("credentialsIntegration")
        .select("*, certificate(*), template:recipientEmailTemplate(*)")
        .eq("workspaceAlias", workspaceId)
        .order("created_at", { ascending: false })
        .range(from, to);

      const { data, error, status, count } = await query;

      console.log(data);

      if (error) {
        return NextResponse.json(
          {
            error: error?.message,
          },
          {
            status: 400,
          }
        );
      }

      if (error) throw error;

      return NextResponse.json(
        {
          data: {
            data,
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit),
          },
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
      const body = await req.json();

      const { data, error } = await supabase
        .from("credentialsIntegration")
        .upsert(body)
        .select("*")
        .maybeSingle();

      console.log(data);

      if (error) throw error;

      const { data: returnData, error: updateError } = await supabase
        .from(
          body.integrationType === "form"
            ? "forms"
            : body.integrationType === "quiz"
            ? "quiz"
            : "events"
        )
        .update({
          integrationAlias: data?.integrationAlias,
        })
        .eq("id", body.integrationSettings.integratedId)
        .select("*")
        .maybeSingle();

      console.log(returnData, body.integrationSettings.integratedId);

      if (updateError) throw updateError;

      return NextResponse.json(
        { data, msg: "integration created successfully" },
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

export const dynamic = "force-dynamic";
