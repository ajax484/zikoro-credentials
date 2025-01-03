import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash, replaceSpecialText } from "@/utils/helpers";
import axios from "axios";

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

    const response = await axios.post(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/workspaces/${workspaceAlias}/credits/charge`,
      {
        amountToCharge: recipients.length,
        credentialId: certificateGroupId,
        createdBy,
        workspaceId,
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
      const { recipientEmail, recipientFirstName, recipientLastName } =
        recipient;
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
          htmlbody: replaceSpecialText(body, {
            recipient: recipient,
            organization: {},
          }),
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
