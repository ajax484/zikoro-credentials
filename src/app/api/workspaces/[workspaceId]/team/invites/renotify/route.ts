import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } },
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      const payload = await req.json();

      const inviteLink = `https://credentials.zikoro.com/api/workspaces/${payload.workspaceAlias}/team/respond?userEmail=${payload.userEmail}&workspaceAlias=${payload.workspaceAlias}`;

      const emailContent = `
      <p>Hello,</p>
      <p>This is a reminder that you have been invited to join the team at <strong>${payload.workspaceName}</strong>.</p>
      <p>Click the link below to accept the invitation:</p>
      <p><a href="${inviteLink}" target="_blank">${inviteLink}</a></p>
      <p>We look forward to having you on board!</p>
      <p>Best regards,</p>
      <p>The Team</p>
    `;

      var { SendMailClient } = require("zeptomail");

      let client = new SendMailClient({
        url: process.env.NEXT_PUBLIC_ZEPTO_URL,
        token: process.env.NEXT_PUBLIC_ZEPTO_TOKEN,
      });

      const resp = await client.sendMail({
        from: {
          address: process.env.NEXT_PUBLIC_EMAIL,
          name: "Zikoro",
        },
        to: [{ email_address: { address: payload.userEmail } }],
        subject: "Team Invitation Reminder",
        htmlbody: emailContent,
      });

      return NextResponse.json(
        {
          message: "Team Invitation Reminder Sent",
        },
        {
          status: 201,
        },
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        {
          error: "An error occurred while making the request.",
        },
        {
          status: 500,
        },
      );
    }
  } else {
    return NextResponse.json({ error: "Method not allowed" });
  }
}

export const dynamic = "force-dynamic";
