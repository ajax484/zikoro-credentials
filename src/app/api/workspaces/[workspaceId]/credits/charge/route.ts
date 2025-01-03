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
      .gte("expiryDate", new Date().toISOString())
      .order("expiryDate", { ascending: true })
      .order("tokenId", { ascending: true });

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
        .filter(({ id }) => id === 1)
        .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
      silver: tokens
        .filter(({ id }) => id === 2)
        .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
      gold: tokens
        .filter(({ id }) => id === 3)
        .reduce((acc, curr) => acc + curr.CreditPurchased, 0),
    };

    for (const token of tokens) {
      if (remainingCharge <= 0) break;

      const amountCharged = Math.min(balance.bronze, remainingCharge);
      const newBalance = balance.bronze - amountCharged;
      balance.bronze = newBalance;

      const { error: updateError } = await supabase
        .from("credentialsWorkspaceToken")
        .update({ CreditPurchased: newBalance })
        .eq("id", token.id);

      if (updateError) {
        throw new Error(
          `Failed to update token balance for tokenId ${token.tokenId}: ${updateError.message}`
        );
      }

      logs.push({
        workspaceAlias,
        credentialId,
        tokenId: token.tokenId,
        creditAmount: amountCharged,
        activityBy,
        activity: "debit",
        creditBalance: newBalance,
        recipientDetails: payload?.recipientDetails,
      });

      remainingCharge -= amountCharged;
    }

    if (remainingCharge > 0) {
      throw new Error("Insufficient balance to complete the charge.");
    }

    const { error: logError } = await supabase
      .from("credentialTokenUsageHistory")
      .insert(logs);

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

function generateTransactionReference(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export const dynamic = "force-dynamic";
