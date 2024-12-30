import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { workspaceId, credits, email, name } = await req.json();

  if (!workspaceId || !credits || !email || !name) {
    return NextResponse.json(
      {
        error: "Missing required fields",
      },
      {
        status: 400,
      }
    );
  }

  const creditTypes = ["bronze", "silver", "gold"];
  const creditData = creditTypes
    .filter((type) => credits[type])
    .map((type) => ({
      workspaceId,
      tokenId: null,
      amountPaid: credits[type].price * credits[type].amount,
      CreditPurchased: credits[type].price,
    }));

  try {
    const { data, error, status } = await supabase
      .from("credentialsWorkspaceToken")
      .insert(creditData);

    if (error) {
      console.log(error, status);
      throw new Error(`Database insertion error: ${error.message}`);
    }

    // Prepare email content
    const creditDetails = creditTypes
      .filter((type) => credits[type])
      .map(
        (type) => `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: 
        ${credits[type].amount} credits for $${credits[type].price}</li>`
      )
      .join("");

    const emailContent = `
      <p>Hello, ${name}</p>
      <p>Your credit purchase has been recorded successfully for workspace ID: ${workspaceId}.</p>
      <p>Details:</p>
      <ul>${creditDetails}</ul>
      <p>Thank you for your purchase!</p>
    `;

    var { SendMailClient } = require("zeptomail");

    let client = new SendMailClient({
      url: process.env.NEXT_PUBLIC_ZEPTO_URL,
      token: process.env.NEXT_PUBLIC_ZEPTO_CREDIT,
    });

    const resp = await client.sendMail({
      from: {
        address: process.env.NEXT_PUBLIC_EMAIL,
        name: "Zikoro",
      },
      to: [{ email_address: { address: email } }],
      subject: "Credit Purchase Confirmation",
      htmlbody: emailContent,
    });

    return NextResponse.json(
      {
        message: "Credit records created and email sent successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}
