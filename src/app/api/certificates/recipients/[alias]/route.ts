import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { CertificateRecipient } from "@/types/certificates";

export async function GET(
  req: NextRequest,
  { params }: { params: { alias: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "GET") {
    try {
      const { alias } = params;

      let certificate: CertificateRecipient | null = null;

      const { data, error, status } = await supabase
        .from("certificateRecipients")
        .select(
          "*, originalCertificate:certificate!inner(*, workspace:organization!inner(*))"
        )
        .eq("certificateId", alias)
        .eq("isValid", true);
      // .maybeSingle();

      console.log(data);

      if (error) throw error;

      return NextResponse.json(
        { data: data[0] },
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
