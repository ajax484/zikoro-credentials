import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { certificateId } = params;
    const bodyParams = await req.json();
    const { social } = bodyParams;

    console.log(social);

    let query;

    const { data: certificate, error: fetchError } = await supabase
      .from("certificateRecipients")
      .select("statusDetails")
      .eq("certificateId", certificateId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!certificate) throw new Error("Certificate not found");

    query = supabase
      .from("certificateRecipients")
      .update({
        statusDetails: [
          ...(certificate.statusDetails || []),
          {
            action: "shared on" + social,
            date: new Date().toISOString(),
          },
        ],
      })
      .eq("certificateId", certificateId);

    const { error } = await query;

    if (error) throw error;

    return NextResponse.json(
      {
        data: {
          msg: `Certificates recalled successfully`,
        },
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
