import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, organization, recipientCount } = body;

    if (!email || !firstName) {
      return NextResponse.json(
        { error: "First name and email are required" },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Attempt to store lead in Supabase
    try {
      await supabase.from("leads").insert([
        {
          first_name: firstName,
          last_name: lastName || "",
          email,
          organization: organization || "",
          source: "certificate_generator",
          metadata: { recipientCount },
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (dbErr) {
      console.warn("Lead recording note:", dbErr);
    }

    // Optional email sending via ZeptoMail if env keys exist
    if (
      process.env.NEXT_PUBLIC_ZEPTO_URL &&
      process.env.NEXT_PUBLIC_ZEPTO_TOKEN &&
      process.env.NEXT_PUBLIC_EMAIL
    ) {
      try {
        const { SendMailClient } = require("zeptomail");
        const client = new SendMailClient({
          url: process.env.NEXT_PUBLIC_ZEPTO_URL,
          token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
        });

        await client.sendMail({
          from: {
            address: process.env.NEXT_PUBLIC_EMAIL,
            name: "Zikoro Credentials",
          },
          to: [
            {
              email_address: {
                address: email,
                name: `${firstName} ${lastName || ""}`.trim(),
              },
            },
          ],
          subject: "Your Free Certificates from Zikoro",
          htmlbody: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9fb; border-radius: 8px;">
              <h2 style="color: #7B00FF;">Hi ${firstName},</h2>
              <p style="font-size: 16px; color: #333; line-height: 1.5;">
                Thank you for using the Zikoro Certificate Generator! Your batch of ${recipientCount || 1} certificate(s) was generated successfully.
              </p>
              <p style="font-size: 15px; color: #555; line-height: 1.5;">
                With a full Zikoro account, your recipients also get <strong>verifiable credentials</strong> with scannable QR codes, one-click LinkedIn sharing, and automatic email delivery.
              </p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${req.nextUrl.origin}/signup" style="background: linear-gradient(135deg, #001FCC, #7B00FF); color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Create Free Zikoro Account
                </a>
              </div>
              <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} Zikoro. All rights reserved.
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn("ZeptoMail dispatch note:", emailErr);
      }
    }

    return NextResponse.json(
      { success: true, message: "Lead processed successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in generator download route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process download request" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
