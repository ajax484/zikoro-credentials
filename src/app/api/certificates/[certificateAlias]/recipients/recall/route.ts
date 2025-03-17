import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { type NextApiRequest, type NextApiResponse } from "next";

export async function DELETE(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(req, res);

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
