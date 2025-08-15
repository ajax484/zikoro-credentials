import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  {
    params: { directoryAlias, recipientAlias },
  }: { params: { directoryAlias: string; recipientAlias: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "GET") {
    try {
      const { data, error, status } = await supabase
        .from("directoryrecipient")
        .select("*")
        .eq("recipientAlias", recipientAlias)
        .maybeSingle();

      console.log(data, recipientAlias);

      if (error) throw error;

      return NextResponse.json(
        { data },
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

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const payload = await request.json();
  console.log(payload);

  try {
    const { data, error } = await supabase
      .from("directoryrecipient")
      .upsert(payload)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json(
      { data },
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
}

export const dynamic = "force-dynamic";
