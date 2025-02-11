import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url || "");
      const workspaceAlias = searchParams.get("workspaceAlias");
      console.log(workspaceAlias);
      const page = parseInt(searchParams.get("page") || "1", 10);
      const limit = parseInt(searchParams.get("limit") || "10", 10);

      console.log(page, limit);

      if (isNaN(page) || isNaN(limit)) {
        console.log("invalid pagination parameters");
        return NextResponse.json(
          { error: "Invalid pagination parameters" },
          { status: 400 }
        );
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("organizationTeamMembers_Credentials")
        .select("*", { count: "exact" })
        .eq("workspaceAlias", workspaceId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      return NextResponse.json(
        {
          data: {
            data,
            page,
            limit,
            total: count,
            totalPages: Math.ceil((count || 0) / limit),
          },
        },
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

export async function POST(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      const payload = await req.json();

      //check if user is already a team member and if there are already 5 members
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from("organizationTeamMembers_Credentials")
        .select("*")
        .eq("workspaceAlias", payload.workspaceAlias);

      if (teamMembersError) throw teamMembersError;

      if (teamMembers?.length >= 5) {
        return NextResponse.json(
          {
            error: "You can only have 5 team members",
          },
          {
            status: 400,
          }
        );
      }

      // check if user is already a team member
      const isTeamMember = teamMembers?.some(
        (teamMember) => teamMember.userEmail === payload.userEmail
      );

      if (isTeamMember) {
        return NextResponse.json(
          {
            error: "User is already a team member",
          },
          {
            status: 400,
          }
        );
      }

      const { data, error } = await supabase
        .from("organizationTeamMembers_Credentials")
        .insert({
          userEmail: payload.userEmail,
          userRole: payload.userRole,
          workspaceAlias: payload.workspaceAlias,
        });

      const inviteLink = `https://credentials.zikoro.com/api/workspaces/${payload.workspaceAlias}/team/respond?userEmail=${payload.userEmail}&workspaceAlias=${payload.workspaceAlias}`;

      if (error) throw error;

      const emailContent = `
      <p>Hello,</p>
      <p>You have been invited to join the team at <strong>${payload.workspaceName}</strong>.</p>
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
        subject: "Team Invitation",
        htmlbody: emailContent,
      });

      return NextResponse.json(
        {
          data,
          message: "Team Invitation Sent",
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
