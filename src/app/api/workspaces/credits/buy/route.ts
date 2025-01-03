import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { addYears } from "date-fns";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    workspaceId,
    credits,
    email,
    name,
    workspaceName,
    currency,
    reference,
    workspaceAlias,
    activityBy,
  } = await req.json();

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
    .filter((type) => credits[type] && credits[type].amount > 0)
    .map((type) => ({
      workspaceId,
      tokenId: type === "bronze" ? 1 : type === "silver" ? 2 : 3,
      amountPaid: credits[type].price * credits[type].amount,
      CreditPurchased: credits[type].amount,
      expiryDate: addYears(new Date(), 1),
      currency,
      paymentReference: reference,
    }));

  try {
    const { data, error, status } = await supabase
      .from("credentialsWorkspaceToken")
      .insert(creditData);

    if (error) {
      console.log(error, status);
      throw new Error(`Database insertion error: ${error.message}`);
    }

    const { error: logError } = await supabase
      .from("credentialTokenUsageHistory")
      .insert(
        creditTypes
          .filter((type) => credits[type] && credits[type].amount > 0)
          .map((type) => ({
            workspaceAlias,
            tokenId: type === "bronze" ? 1 : type === "silver" ? 2 : 3,
            CreditAmount: credits[type].price * credits[type].amount,
            transactionReferenceId: reference,
            activityBy: activityBy,
            activity: "credit",
            creditBalance: credits[type].price * credits[type].amount,
          }))
      );

    if (logError) {
      throw new Error(`Failed to insert usage logs: ${logError.message}`);
    }

    // Prepare email content
    const creditDetails = creditTypes
      .filter((type) => credits[type] && credits[type].amount > 0)
      .map(
        (type) => `<li>${type.charAt(0).toUpperCase() + type.slice(1)}: 
        ${credits[type].amount} credits for ${currency}${
          credits[type].price * credits[type].amount
        }</li>`
      )
      .join("");

    const emailContent = `
      <p>Hello, ${name}</p>
      <p>Your credit purchase has been recorded successfully for workspace: ${workspaceName}.</p>
      <p>Details:</p>
      <p>Reference: <strong>${reference}</strong></p>
      <ul>${creditDetails}</ul>
      <p>Thank you for your purchase!</p>
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
      to: [{ email_address: { address: email } }],
      subject: "Credit Purchase Confirmation",
      htmlbody: emailContent,
    });

    return NextResponse.json(
      {
        data: {
          message: "Credit records created and email sent successfully.",
        },
      },
      {
        status: 201,
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
