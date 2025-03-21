import { createHash, replaceSpecialText } from "@/utils/helpers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import pLimit from "p-limit";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const bodyParams = await req.json();

    const {
      workspaceId,
      certificateGroupId,
      workspaceAlias,
      recipients,
      integrationAlias,
      createdBy,
      organization,
    } = bodyParams;

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
            : certificate?.hasQRCode
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
                action: "release",
                date: new Date().toISOString(),
              },
            ],
          };
        }),
        { onConflict: "id" }
      )
      .select("*, certificate!inner(*)");

    if (error) throw error;

    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("template:recipientEmailTemplate(*)")
      .eq("integrationAlias", integrationAlias)
      .maybeSingle();

    if (integrationError) throw integrationError;
    if (!integration) {
      throw new Error("Invalid integration");
    }

    const template = integration.template;

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
              name: template.senderName,
            },
            to: [
              {
                email_address: {
                  address: recipientEmail,
                  name: `${recipientFirstName} ${recipientLastName}`,
                },
              },
            ],
            subject: template.subject,
            htmlbody: `
                  <div style="background-color: #f7f8ff; width: 100%; margin: 0 auto; padding: 20px;">
        <div style="width: 500px; margin: 0 auto;">
          <div style="margin: 20px auto; display: table;">
            ${
              template.showLogo && template.logoUrl
                ? `<img src="${template.logoUrl}" style="width: 150px; height: auto;">`
                : ""
            }
          </div>
      
          <div style="margin-top: 20px; border: 1px solid ${
            template.buttonProps.backgroundColor
          }; padding: 20px; background-color: white; border-radius: 5px;">
          <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">${
            template.header
          }</h1>
            ${replaceSpecialText(body, {
              recipient,
              organization,
              asset: recipient.certificate,
            })}
      
            <div style="width: fit-content; margin: 20px auto; border-top: 1px solid #e5e5e5; padding-top: 20px; text-align: center;">
              <p style="margin-bottom: 10px; font-style: italic; text-align: center;">View on a desktop computer for the best experience</p>
              <a href="https://credentials.zikoro.com/credentials/verify/certificate/${certificateId}"
                style="display: inline-block; background-color: ${
                  buttonProps.backgroundColor
                };
                       color: ${buttonProps.textColor}; text-decoration: none;
                       padding: 3px 12px; border-radius: 5px;
                       font-family: Arial, sans-serif; font-size: 14px; font-weight: bold;">
                ${buttonProps.text}
              </a>
            </div>
          </div>
      
          ${
            showCustomLinks
              ? `<table role="presentation" style="width: 100%; margin-top: 20px; text-align: center;">
                   <tr>
                     ${organization?.socialLinks
                       ?.map((link) =>
                         link.url
                           ? `<td style="padding: 5px;">
                              <a href="${link.url}" style="color: #4b5563; font-size: 14px; font-weight: 600;">
                                ${link.title}
                              </a>
                            </td>`
                           : ""
                       )
                       .join("")}
                   </tr>
                 </table>           
                 `
              : ""
          }
      
          ${
            showSocialLinks
              ? `
            <table role="presentation" style="width: 100%; margin-top: 20px; text-align: center;">
                 <tr>
                 <td style="padding: 5px;">
                   <a href="${
                     organization?.linkedIn || ""
                   }" style='color: #4b5563; font-size: 14px; font-weight: 600;'>
                            Linkedin
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.x || ""
                          }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                            X
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.instagram || ""
                          }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                            Instagram
                          </a>
                          </td>
                          <td style="padding: 5px;">
                          <a href="${
                            organization?.facebook || ""
                          }" style="color: #4b5563; font-size: 14px; font-weight: 600;>
                            Facebook
                          </a>
                          </td>
                        </tr>
                 </table>
            `
              : ""
          }
      
          <table role="presentation" style="width: 60%; margin: 20px auto; margin-bottom: 0px; text-align: center;">
                 <tr>
                 <td style="padding: 5px;">
            <span style="font-size: 14px; font-weight: 700;">Powered by</span>
            </td>
                 <td style="padding: 5px;">
            <img src="https://res.cloudinary.com/zikoro/image/upload/v1740499848/ZIKORO/zikoro_bookings_logo_2_v2xetg.png" style="width: 150px; height: auto;">
            </td>
                 </tr>  
                 </table>
          </div>
        </div>
      </div>
      
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
        data,
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
