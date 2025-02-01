import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("userEmail");
    const workspaceAlias = searchParams.get("workspaceAlias");

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("userEmail", userEmail)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.redirect(
      new URL(data ? `/home?workspaceAlias=${workspaceAlias}` : "/", req.url)
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { msg: "An error occurred while making the request." },
      {
        status: 500,
      }
    );
  }
}
