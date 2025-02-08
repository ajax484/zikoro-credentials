import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHash, replaceSpecialText } from "@/utils/helpers";
import axios from "axios";
import { TCertificate } from "@/types/certificates";
// Import p-limit for concurrency control
import pLimit from "p-limit";

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
      showLogo,
      logoUrl,
      showSocialLinks,
      organization,
    } = bodyParams;

    console.log(
      certificateGroupId,
      recipients,
      subject,
      body,
      action,
      senderName
    );

    // Get certificate details
    const { data: certificate, error: certificateError } = await supabase
      .from("certificate")
      .select("*")
      .eq("id", certificateGroupId)
      .single();

    if (certificateError) throw certificateError;
    if (!certificate) {
      throw new Error("Invalid certificate");
    }

    // Charge tokens (assumes the endpoint returns 201 on success)
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

    // Upsert all recipients in one batch
    const { data: recipientData, error } = await supabase
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
      .select("*, certificate!inner(*)");

    if (error) throw error;

    // Create a concurrency limiter (e.g., limit to 10 concurrent email sends)
    const limit = pLimit(10);

    // Map over recipientData to create an array of promise-returning functions
    const emailPromises = recipientData.map((recipient: any) =>
      limit(async () => {
        const {
          recipientEmail,
          recipientFirstName,
          recipientLastName,
          certificateId,
        } = recipient;
        try {
          // Import ZeptoMail's client. (This can be imported once at the top if desired.)
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
            ${
              showLogo && logoUrl
                ? `<img src="${logoUrl}" style="width: 100px; height: auto; margin-bottom: 20px; margin: auto">`
                : ""
            }
            <div style="margin-top: 20px;">
              ${replaceSpecialText(body, {
                recipient,
                organization,
                asset: recipient.certificate,
              })}
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="margin-bottom: 20px;">View in a desktop screen for best experience</p>
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
            ${
              showSocialLinks
                ? `
              <div style='display: flex; align-items: center; justify-content: center; gap: 16px; color: #4b5563; margin-top: 20px;'>
                <a href="${
                  organization?.linkedIn || ""
                }" style='display: flex; align-items: center; gap: 8px;'>
                  <svg stroke='currentColor' fill='currentColor' stroke-width='0' viewBox='0 0 1024 1024' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'><path d='M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zM349.3 793.7H230.6V411.9h118.7v381.8zm-59.3-434a68.8 68.8 0 1 1 68.8-68.8c-.1 38-30.9 68.8-68.8 68.8zm503.7 434H675.1V608c0-44.3-.8-101.2-61.7-101.2-61.7 0-71.2 48.2-71.2 98v188.9H423.7V411.9h113.8v52.2h1.6c15.8-30 54.5-61.7 112.3-61.7 120.2 0 142.3 79.1 142.3 181.9v209.4z'></path></svg>
                </a>
                <a href="${
                  organization?.x || ""
                }" style='display: flex; align-items: center; gap: 8px;'>
                  <svg stroke='currentColor' fill='currentColor' stroke-width='0' viewBox='0 0 1024 1024' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'><path d='M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0 0 75-94 336.64 336.64 0 0 1-108.2 41.2A170.1 170.1 0 0 0 672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 0 0-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 0 1-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 0 1-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z'></path></svg>
                </a>
                <a href="${
                  organization?.instagram || ""
                }" style='display: flex; align-items: center; gap: 8px;'>
                  <svg stroke='currentColor' fill='currentColor' stroke-width='0' viewBox='0 0 1024 1024' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'><path d='M512 378.7c-73.4 0-133.3 59.9-133.3 133.3S438.6 645.3 512 645.3 645.3 585.4 645.3 512 585.4 378.7 512 378.7zM911.8 512c0-55.2.5-109.9-2.6-165-3.1-64-17.7-120.8-64.5-167.6-46.9-46.9-103.6-61.4-167.6-64.5-55.2-3.1-109.9-2.6-165-2.6-55.2 0-109.9-.5-165 2.6-64 3.1-120.8 17.7-167.6 64.5C132.6 226.3 118.1 283 115 347c-3.1 55.2-2.6 109.9-2.6 165s-.5 109.9 2.6 165c3.1 64 17.7 120.8 64.5 167.6 46.9 46.9 103.6 61.4 167.6 64.5 55.2 3.1 109.9 2.6 165 2.6 55.2 0 109.9.5 165-2.6 64-3.1 120.8-17.7 167.6-64.5 46.9-46.9 61.4-103.6 64.5-167.6 3.2-55.1 2.6-109.8 2.6-165zM512 717.1c-113.5 0-205.1-91.6-205.1-205.1S398.5 306.9 512 306.9 717.1 398.5 717.1 512 625.5 717.1 512 717.1zm213.5-370.7c-26.5 0-47.9-21.4-47.9-47.9s21.4-47.9 47.9-47.9 47.9 21.4 47.9 47.9a47.84 47.84 0 0 1-47.9 47.9z'></path></svg>
                </a>
                <a href="${
                  organization?.facebook || ""
                }" style='display: flex; align-items: center; gap: 8px;'>
                  <svg stroke='currentColor' fill='currentColor' stroke-width='0' viewBox='0 0 512 512' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'><path d='M504 256C504 119 393 8 256 8S8 119 8 256c0 123.78 90.69 226.38 209.25 245V327.69h-63V256h63v-54.64c0-62.15 37-96.48 93.67-96.48 27.14 0 55.52 4.84 55.52 4.84v61h-31.28c-30.8 0-40.41 19.12-40.41 38.73V256h68.78l-11 71.69h-57.78V501C413.31 482.38 504 379.78 504 256z'></path></svg>
                </a>
              </div>
            `
                : ""
            }
          `,
          });
        } catch (emailError) {
          console.error(
            `Error sending email to ${recipientEmail}:`,
            emailError
          );
        }
      })
    );

    // Wait for all email send tasks to complete
    await Promise.all(emailPromises);

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
