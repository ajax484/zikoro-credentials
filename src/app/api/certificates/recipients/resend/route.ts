import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const bodyParams = await req.json();
    const { recipients } = bodyParams;

    let query;

    query = supabase
      .from("certificateRecipients")
      .upsert(
        recipients.map((recipient: any) => {
          return {
            ...recipient,
            status: "email resent",
            statusDetails: [
              ...recipient.statusDetails,
              {
                action: "email resent",
                date: new Date().toISOString(),
              },
            ],
          };
        }),
        { onConflict: "id" }
      )
      .select("*, certificate!inner(*)");

    const { data: recipientData, error } = await query;

    if (error) throw error;

    // Sending emails using ZeptoMail
    for (const recipient of recipientData) {
      const {
        recipientEmail,
        recipientFirstName,
        recipientLastName,
        certificate: { name: certificateName },
      } = recipient;
      try {
        const { SendMailClient } = require("zeptomail");
        const client = new SendMailClient({
          url: process.env.NEXT_PUBLIC_ZEPTO_URL,
          token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
        });

        await client.sendMail({
          from: {
            address: process.env.NEXT_PUBLIC_EMAIL,
            name: "Zikoro",
          },
          to: [
            {
              email_address: {
                address: recipientEmail,
                name: `${recipientFirstName} ${recipientLastName}`,
              },
            },
          ],
          subject: `Resending ${certificateName}`,
          htmlbody: `
          Hi ${recipientFirstName},\n\n
www.credentials.zikoro.com/credentials/verify/certificate/${recipient.certificateId}\n
          Your certificate is ready for download. Access it now through this link: https://www.credentials.zikoro.com/credentials/verify/certificate/${recipient.certificateId}\n
          Best,\n
          Zikoro Team
          `,
        });
      } catch (emailError) {
        console.error(`Error sending email to ${recipientEmail}:`, emailError);
      }
    }

    return NextResponse.json(
      {
        data: {
          msg: `Certificates resent successfully`,
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
