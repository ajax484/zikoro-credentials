import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { CertificateRecipient } from "@/types/certificates";

export async function GET(
  req: NextRequest,
  { params }: { params: { certificateId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "GET") {
    try {
      const { certificateId } = params;

      let certificate: CertificateRecipient | null = null;

      const { data, error, status } = await supabase
        .from("certificateRecipients")
        .select(
          "*, originalCertificate:certificate!inner(*, workspace:organization!inner(*))"
        )
        .eq("certificateId", certificateId)
        .eq("isValid", true)
        // .maybeSingle();

      console.log(data, certificateId);

      if (error) throw error;

      certificate = data[0];

      if (data.status !== "email opened" || data.status !== "revoked") {
        const { data: updatedCertificate, error: updateError } = await supabase
          .from("certificateRecipients")
          .update({
            status: "email opened",
            statusDetails: [
              ...(data.statusDetails ?? []),
              {
                action: "email opened",
                date: new Date().toISOString(),
              },
            ],
          })
          .eq("certificateId", certificateId)
          .select(
            "*, originalCertificate:certificate!inner(*, workspace:organization!inner(*))"
          );
        // .maybeSingle();

        console.log(updatedCertificate);

        if (updateError) throw updateError;

        certificate = updatedCertificate[0];
      }

      return NextResponse.json(
        { data: certificate },
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
