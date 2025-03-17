import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const bodyParams = await req.json();
    const { ids } = bodyParams;

    console.log(ids);

    const { data: certificates, error: fetchError } = await supabase
      .from("certificateRecipients")
      .select("*")
      .in("id", ids);

    if (fetchError) throw fetchError;

    let query;

    query = supabase
      .from("certificateRecipients")
      .update(
        certificates.map((certificate) => ({
          isValid: true,
          status: "reissued",
          statusDetails: [
            ...(certificate.statusDetails || []),
            {
              action: "reissued",
              date: new Date().toISOString(),
            },
          ],
        }))
      )
      .in("id", ids)
      .select("*, certificate!inner(*)");

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(
      {
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing the request:", error);
    return NextResponse.json(
      {
        error: "An error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
