import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash, replaceSpecialText } from "@/utils/helpers";
import axios from "axios";
import { TCertificate } from "@/types/certificates";

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
    const {
      certificateGroupId,
      recipients,
      subject,
      body,
      action,
      senderName,
      status,
      createdBy,
      workspaceAlias,
      workspaceId,
    } = bodyParams;

    console.log(
      certificateGroupId,
      recipients,
      subject,
      body,
      action,
      senderName
    );

    const { data: certificate, error: certificateError } = await supabase
      .from("certificate")
      .select("*")
      .eq("id", certificateGroupId)
      .single();

    if (certificateError) throw certificateError;

    if (!certificate) {
      throw new Error("Invalid certificate");
    }

    const response = await axios.post(
      `${req.nextUrl.origin}/api/workspaces/${workspaceAlias}/credits/charge`,
      {
        amountToCharge: recipients.length,
        credentialId: certificateGroupId,
        activityBy: createdBy,
        workspaceId,
        workspaceAlias,
        recipientDetails: recipients,
        tokenId:
          certificate?.attributes && certificate?.attributes.length > 0
            ? 3
            : certificate.hasQRCode
            ? 2
            : 1,
        credentialType: "certificate",
      }
    );

    console.log(response.status);

    if (response.status !== 201) {
      throw new Error("Failed to charge tokens");
    }

    let query;

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
            status,
            statusDetails: [
              {
                action,
                date: new Date().toISOString(),
              },
            ],
          };
        }),
        { onConflict: "id" }
      )
      .select("*");

    const { data: recipientData, error } = await query;

    if (error) throw error;

    // Sending emails using ZeptoMail
    for (const recipient of recipientData) {
      const {
        recipientEmail,
        recipientFirstName,
        recipientLastName,
        certificateId,
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
          htmlbody: `
          <div>
          ${replaceSpecialText(body, {
            recipient: recipient,
            organization: {},
          })}
          </div>
          <div style="text-align: center; margin-top: 20px;">
  <a
    href="https://credentials.zikoro.com/credentials/verify/certificate/${certificateId}"
    style="
      display: inline-block;
      background-color: #9D00FF;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      font-weight: bold;
    "
  >
    View
  </a>
</div>

          `,
        });
      } catch (emailError) {
        console.error(`Error sending email to ${recipientEmail}:`, emailError);
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
