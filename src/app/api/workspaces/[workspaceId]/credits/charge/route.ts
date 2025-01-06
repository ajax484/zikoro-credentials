import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { workspaceId: workspaceAlias } = params;
    const payload = await req.json();
    const { amountToCharge, activityBy, credentialId, workspaceId } = payload;

    const { data: tokens, error: creditsError } = await supabase
      .from("credentialsWorkspaceToken")
      .select("*")
      .eq("workspaceId", workspaceId)
      .eq("tokenId", 1)
      .gte("expiryDate", new Date().toISOString())
      .order("expiryDate", { ascending: true });

    if (creditsError) {
      throw new Error(`Failed to fetch tokens: ${creditsError.message}`);
    }

    if (!tokens || tokens.length === 0) {
      throw new Error("No valid tokens available for charging.");
    }

    let remainingCharge = amountToCharge;
    const logs = [];

    const balance = {
      bronze: tokens
        .filter(({ tokenId }) => tokenId === 1)
        .reduce((acc, curr) => acc + curr.creditRemaining, 0),
      silver: tokens
        .filter(({ tokenId }) => tokenId === 2)
        .reduce((acc, curr) => acc + curr.creditRemaining, 0),
      gold: tokens
        .filter(({ tokenId }) => tokenId === 3)
        .reduce((acc, curr) => acc + curr.creditRemaining, 0),
    };

    console.log(balance);

    for (const token of tokens) {
      if (remainingCharge <= 0) break;

      const amountCharged = Math.min(token.creditRemaining, remainingCharge);
      remainingCharge -= amountCharged;
      const newBalance = token.creditRemaining - amountCharged;

      const { error: updateError } = await supabase
        .from("credentialsWorkspaceToken")
        .update({ creditRemaining: newBalance })
        .eq("id", token.id);

      if (updateError) {
        throw new Error(
          `Failed to update token balance for tokenId ${token.tokenId}: ${updateError.message}`
        );
      }
    }

    if (remainingCharge > 0) {
      throw new Error("Insufficient balance to complete the charge.");
    }

    const { error: logError } = await supabase
      .from("credentialTokenUsageHistory")
      .insert({
        workspaceAlias,
        credentialId,
        tokenId: 1,
        creditAmount: amountToCharge,
        activityBy,
        activity: "debit",
        creditBalance: balance.bronze - amountToCharge,
        recipientDetails: payload?.recipientDetails,
      });

    if (logError) {
      throw new Error(`Failed to insert usage logs: ${logError.message}`);
    }

    return NextResponse.json(
      { msg: "Charge successful and logged successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}

// function generateTransactionReference(): string {
//   return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// }

export const dynamic = "force-dynamic";
