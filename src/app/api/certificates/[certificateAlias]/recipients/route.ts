import { NextApiRequest, NextApiResponse } from "next";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "@/utils/helpers";
import { CertificateRecipient } from "@/types/certificates";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
  if (req.method === "POST") {
    try {
      const {
        certificateGroupId,
        recipients,
        subject,
        body,
        action,
        senderName,
      } = req.json();

      let query;

      if (action === "release") {
        query = await supabase
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
          .select("*, attendee:attendees!inner(*)");
      } else {
        query = await supabase
          .from("attendeeCertificates")
          .delete()
          .eq("CertificateGroupId", certificateGroupId)
          .in(
            "attendeeId",
            recipients.map(
              ({ recipient }: { recipient: number }) => recipient.id
            )
          );
      }

      const { data: certificateData, error } = query;

      if (error) throw error;

      if (action === "release") {
        // let nodemailer = require("nodemailer");
        // const transporter = nodemailer.createTransport({
        //   host: "smtp.zoho.com",
        //   port: 465,
        //   secure: true,
        //   auth: {
        //     user: process.env.NEXT_PUBLIC_EMAIL,
        //     pass: process.env.NEXT_PUBLIC_EMAIL_PASSWORD,
        //   },
        // });

        (certificateData as CertificateRecipient[]).forEach(
          async (certificate: CertificateRecipient) => {
            const { recipientEmail, recipientFirstName, recipientLastName } =
              certificate;

            try {
              var { SendMailClient } = require("zeptomail");

              let client = new SendMailClient({
                url: process.env.NEXT_PUBLIC_ZEPTO_URL,
                token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
              });

              const resp = await client.sendMail({
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
            } catch (error) {
              console.error(`Error sending email to ${recipientEmail}:`, error);
            }
          }
        );
      }

      return NextResponse.json(
        {
          data: {
            msg: `certificates ${
              action + (action === "release" ? "d" : "ed")
            } successfully`,
          },
        },
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
