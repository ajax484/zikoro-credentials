import { generateAlias } from "@/utils/helpers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { isPast } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "POST") {
    try {
      //fetch workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from("organization")
        .select("*")
        .eq("organizationAlias", workspaceId)
        .maybeSingle();

      if (workspaceError) throw workspaceError;

      if (!workspace) throw new Error("Invalid workspace");

      //create directory
      const { data: directory, error: directoryError } = await supabase
        .from("credentialsDirectory")
        .insert([
          {
            organizationAlias: workspace.organizationAlias,
            directoryName: workspace.organizationName + " Directory",
            directoryAlias: generateAlias(),
          },
        ])
        .select("*, recipientCount:directoryRecipients(count)")
        .maybeSingle();

      if (directoryError) throw directoryError;

      console.log(directory);

      const { recipientCount, ...directoryData } = directory;

      return NextResponse.json(
        {
          data: {
            ...directoryData,
            recipientCount: recipientCount[0].count,
          },
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

export async function GET(
  req: NextRequest,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  if (req.method === "GET") {
    try {
      //fetch all directories and log
      // const { data: directories, error: directoryError } = await supabase
      //   .from("credentialsDirectory")
      //   .select("*")
      //   .range(0, 1000);

      // console.log(directories);

      const { data, error } = await supabase
        .from("credentialsDirectory")
        .select("*")
        .eq("organizationAlias", workspaceId)
        .maybeSingle();

      console.log(data);

      if (error) throw error;

      // get directory recipients count, count of certificates, count of expired certificastes
      console.log(data.directoryAlias);
      const {
        data: directoryRecipients,
        error: directoryRecipientsError,
        count,
      } = await supabase
        .from("directoryrecipient")
        .select(
          "*, certificateRecipients(certificate!inner(certificateSettings))",
          { count: "exact" }
        )
        .eq("directoryAlias", data.directoryAlias);

      if (directoryRecipientsError) throw directoryRecipientsError;

      const certificatesCount = directoryRecipients.reduce(
        (acc, curr) => acc + (curr.certificateRecipients.length || 0),
        0
      );

      const expiredCount = directoryRecipients.reduce(
        (acc, curr) =>
          acc +
          (curr.certificateRecipients.filter(
            (certificate) =>
              certificate.certificate.certificateSettings.expiryDate &&
              isPast(certificate.certificate.certificateSettings.expiryDate)
          ).length || 0),
        0
      );

      return NextResponse.json(
        {
          data: {
            ...data,
            recipientCount: count,
            certificatesCount,
            expiredCount,
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

export const dynamic = "force-dynamic";
