import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const workspaceAlias = searchParams.get("workspaceAlias");

    if (!userEmail || !workspaceAlias) {
      return NextResponse.json(
        { error: "Missing required parameters." },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("userEmail", userEmail)
      .maybeSingle();

    if (userError) {
      throw new Error(`User lookup failed: ${userError.message}`);
    }

    // Fetch all team members and check if the user is already a member
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from("organizationTeamMembers_Credentials")
      .select("userEmail")
      .eq("workspaceAlias", workspaceAlias);

    if (teamMembersError) {
      throw new Error(
        `Fetching team members failed: ${teamMembersError.message}`
      );
    }

    if (teamMembers.length >= 5) {
      return NextResponse.json(
        { error: "You can only have 5 team members." },
        { status: 400 }
      );
    }

    if (teamMembers.some((member) => member.userEmail === userEmail)) {
      return NextResponse.redirect("/");
    }

    // Check for existing invitation and get the role
    const { data: inviteData, error: inviteError } = await supabase
      .from("credentialsWorkspaceInvites")
      .update({
        status: "accepted",
      })
      .eq("workspaceAlias", workspaceAlias)
      .eq("email", userEmail)
      .select("role")
      .maybeSingle();

    if (inviteError || !inviteData) {
      throw new Error(
        `Invite lookup failed: ${
          inviteError?.message || "No valid invite found"
        }`
      );
    }

    // Insert user into organization team
    const { error: insertError } = await supabase
      .from("organizationTeamMembers_Credentials")
      .insert({
        userEmail,
        userRole: inviteData.role,
        workspaceAlias,
      });

    if (insertError) {
      throw new Error(`Failed to add user to team: ${insertError.message}`);
    }

    // Redirect based on user presence
    const redirectUrl = user ? `/home?workspaceAlias=${workspaceAlias}` : "/";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error:
          (error as Error).message ||
          "An error occurred while processing the request.",
      },
      { status: 500 }
    );
  }
}
