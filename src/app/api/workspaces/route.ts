import createClient from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { type NextApiRequest, type NextApiResponse } from "next";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createClient(req, res);

  if (req.method === "GET") {
    try {
      const { searchParams } = new URL(req.url!);
      const userEmail = searchParams.get("userEmail");

      // Get all workspace aliases for the user
      const { data, error } = await supabase
        .from("organizationTeamMembers_Credentials")
        .select("workspaceAlias")
        .eq("userEmail", userEmail)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const workspaceAliases = data?.map(
        ({ workspaceAlias }) => workspaceAlias
      );

      // Fetch organizations with only the current user's role
      const { data: organizations, error: organizationsError } = await supabase
        .from("organization")
        .select(
          `
          *,
          verification:organizationVerification(*),
          role:organizationTeamMembers_Credentials(userRole)
        `
        )
        .eq("organizationTeamMembers_Credentials.userEmail", userEmail) // Filter by current user
        .order("created_at", { ascending: false })
        .in("organizationAlias", workspaceAliases);

      console.log(userEmail);
      console.log(organizations);

      if (organizationsError) throw organizationsError;

      return NextResponse.json(
        {
          data: organizations,
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

export const dynamic = "force-dynamic";
