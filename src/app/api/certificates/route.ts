import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { generateAlphanumericHash } from "@/utils/helpers";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url);
      const workspaceAlias = searchParams.get("workspaceAlias");

      console.log(workspaceAlias);

      const query = supabase
        .from("certificate")
        .select("*, recipientCount:certificateRecipients!inner(count)")
        .order("lastEdited", { ascending: false, nullsFirst: true });

      if (workspaceAlias) query.eq("workspaceAlias", workspaceAlias);

      const { data, error, status } = await query;

      console.log(data, "certificates");

      if (error) throw error;

      return NextResponse.json(
        {
          data: data.map((certificate) => ({
            ...certificate,
            recipientCount: certificate.recipientCount[0].count,
          })),
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

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "POST") {
    try {
      const certificateAlias = generateAlphanumericHash(12);
      const params = await req.json();

      const { data, error } = await supabase
        .from("certificate")
        .insert({
          certificateAlias,
          name: "untitled credential",
          ...params,
        })
        .select("*")
        .maybeSingle();

      if (error) throw error;

      return NextResponse.json(
        { msg: "certificate created successfully", data },
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

export async function PATCH(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "POST") {
    try {
      const params = await req.json();

      console.log(params);

      const { data, error } = await supabase
        .from("certificate")
        .upsert(params)
        .select()
        .maybeSingle();

      console.log(data);
      if (error) throw error;

      return NextResponse.json(
        { msg: "certificate saved successfully", data },
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

export const dynamic = "force-dynamic";
