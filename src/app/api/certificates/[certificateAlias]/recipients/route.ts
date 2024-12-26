import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "@/utils/helpers";
import { CertificateRecipient } from "@/types/certificates";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { certificateAlias } = req.query;

  if (req.method === "GET") {
    try {
      const supabase = createRouteHandlerClient({ cookies });
      const { data: recipients, error } = await supabase
        .from("certificateRecipients")
        .select("*")
        .eq("certificateAlias", String(certificateAlias));

      if (error) {
        throw error;
      }

      res.status(200).json(recipients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipients" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 } // Correct status code for unsupported HTTP methods
    );
  }

  try {
    // Parse request JSON
    const bodyParams = await req.json();
    const {
      certificateGroupId,
      recipients,
      subject,
      body,
      action,
      senderName,
    } = bodyParams;

    console.log(
      certificateGroupId,
      recipients,
      subject,
      body,
      action,
      senderName
    );

    let query;

    if (action === "release") {
      // Upsert recipients into `certificateRecipients`
      query = supabase
        .from("certificateRecipients")
        .upsert(
          recipients.map((recipient: any) => {
            const certificateId = createHash(
              JSON.stringify({ certificateGroupId, ...recipient })
            );

            return {
              certificateGroupId,
              certificateId,
              ...recipient,
            };
          }),
          { onConflict: "id" }
        )
        .select("*");
    } else if (action === "revoke") {
      // Delete entries in `attendeeCertificates`
      query = supabase
        .from("attendeeCertificates")
        .delete()
        .eq("CertificateGroupId", certificateGroupId)
        .in(
          "attendeeId",
          recipients.map((recipient: { id: number }) => recipient.id)
        );
    } else {
      throw new Error("Invalid action specified.");
    }

    const { data: certificateData, error } = await query;

    if (error) throw error;

    if (action === "release") {
      // Sending emails using ZeptoMail
      for (const certificate of certificateData) {
        const { recipientEmail, recipientFirstName, recipientLastName } =
          certificate;
        try {
          const { SendMailClient } = require("zeptomail");
          const client = new SendMailClient({
            url: process.env.NEXT_PUBLIC_ZEPTO_URL,
            token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
          });

          await client.sendMail({
            from: {
              address: process.env.NEXT_PUBLIC_EMAIL,
              name: senderName,
            },
            to: [
              {
                email_address: {
                  address: recipientEmail,
                  name: `${recipientFirstName} ${recipientLastName}`,
                },
              },
            ],
            subject,
            htmlbody: body,
          });
        } catch (emailError) {
          console.error(
            `Error sending email to ${recipientEmail}:`,
            emailError
          );
        }
      }
    }

    return NextResponse.json(
      {
        data: {
          msg: `Certificates ${action}${
            action === "release" ? "d" : "ed"
          } successfully`,
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
