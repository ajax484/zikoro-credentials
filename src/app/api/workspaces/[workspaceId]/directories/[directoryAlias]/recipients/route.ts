import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params: { directoryAlias } }: { params: { directoryAlias: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  if (req.method === "GET") {
    try {
      const { data, error, status } = await supabase
        .from("directoryrecipient")
        .select(
          "*, assignedCertificates:certificateRecipients(*, certificate(*))"
        )
        .eq("directoryAlias", directoryAlias);

      console.log(data, directoryAlias);

      if (error) throw error;

      return NextResponse.json(
        { data },
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
  request: Request,
  { params: { workspaceId } }: { params: { workspaceId: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  const payload = await request.json();
  console.log(payload);

  try {
    let returnedData = {};
    const { data, error } = await supabase
      .from("directoryrecipient")
      .upsert(payload, { onConflict: "email" })
      .select(
        "*, assignedCertificates:certificateRecipients(*, certificate(*))"
      )
      .maybeSingle();

    console.log(data);

    if (error) {
      return NextResponse.json(
        { error: error.details },
        {
          status: 500,
        }
      );
    }

    returnedData = data;

    if (!payload.id) {
      //fetch all certificate id from certificate table with workspaceId
      const { data: certificateIds, error: certificateError } = await supabase
        .from("certificate")
        .select("id")
        .eq("workspaceAlias", workspaceId);

      if (certificateError) throw certificateError;

      const IDs = certificateIds.map((certificate) => parseInt(certificate.id));
      console.log(IDs);

      // update recipientAlias to certificates with same email
      const { data: recipients, error: recipientError } = await supabase
        .from("certificateRecipients")
        .update({ recipientAlias: data.recipientAlias })
        .eq("recipientEmail", data.email)
        .in("certificateGroupId", IDs);

      if (recipientError) throw recipientError;

      console.log(data.recipientAlias);
      const { data: updatedRecipient, error: updatedError } = await supabase
        .from("directoryrecipient")
        .select(
          "*, assignedCertificates:certificateRecipients(*, certificate(*))"
        )
        .eq("recipientAlias", data.recipientAlias)
        .maybeSingle();

      console.log(updatedRecipient);

      if (updatedError) throw updatedError;

      returnedData = updatedRecipient;
    }

    return NextResponse.json(
      { data: returnedData },
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
}

// delete all
export async function DELETE(
  request: Request,
  { params: { directoryAlias } }: { params: { directoryAlias: number } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from("directoryrecipient")
      .delete()
      .eq("directoryAlias", directoryAlias);

    if (error) throw error;

    return NextResponse.json(
      {
        data,
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
}

export const dynamic = "force-dynamic";
