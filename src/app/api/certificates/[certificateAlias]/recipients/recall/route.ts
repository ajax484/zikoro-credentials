import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const bodyParams = await req.json();
    const { certificateGroupId, ids } = bodyParams;

    let query;

    query = supabase
      .from("certificateRecipients")
      .delete()
      .eq("CertificateGroupId", certificateGroupId)
      .in("attendeeId", ids);

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
