import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { addYears } from "date-fns";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { workspaceId } = params;
    const payload = await req.json();
    const {
      workspaceAlias,
      activityBy,
      fromTokenId,
      toTokenId,
      fromAmount,
      toAmount,
    } = payload;

    if (!fromTokenId || !toTokenId || !fromAmount || !toAmount) {
      return NextResponse.json(
        { error: "Missing required fields for conversion." },
        { status: 400 }
      );
    }

    if (fromTokenId <= toTokenId) {
      return NextResponse.json(
        { error: "Invalid conversion direction. You can only convert to a lower tier." },
        { status: 400 }
      );
    }

    if (fromAmount !== toAmount) {
      return NextResponse.json(
        { error: "Conversion must be at a 1:1 rate." },
        { status: 400 }
      );
    }

    const { data: tokens, error: creditsError } = await supabase
      .from("credentialsWorkspaceToken")
      .select("*")
      .eq("workspaceId", workspaceId)
      .eq("tokenId", fromTokenId)
      .gt("creditRemaining", 0)
      .gte("expiryDate", new Date().toISOString())
      .order("expiryDate", { ascending: true });

    if (creditsError) {
      throw new Error(`Failed to fetch tokens: ${creditsError.message}`);
    }

    if (!tokens || tokens.length === 0) {
      throw new Error("No valid tokens available for conversion.");
    }

    let remainingCharge = fromAmount;
    const balanceBeforeDeduct = tokens.reduce((acc, curr) => acc + curr.creditRemaining, 0);

    if (balanceBeforeDeduct < fromAmount) {
      throw new Error("Insufficient balance to complete the conversion.");
    }

    // Deduct from existing tokens
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

    // Insert new token for converted credits
    const { error: insertError } = await supabase
      .from("credentialsWorkspaceToken")
      .insert({
        workspaceId: parseInt(workspaceId),
        tokenId: toTokenId,
        amountPaid: 0,
        CreditPurchased: toAmount,
        creditRemaining: toAmount,
        expiryDate: addYears(new Date(), 1),
      });

    if (insertError) {
      throw new Error(`Failed to insert converted tokens: ${insertError.message}`);
    }

    // Calculate balances for logs
    const { data: updatedFromTokens } = await supabase
      .from("credentialsWorkspaceToken")
      .select("creditRemaining")
      .eq("workspaceId", workspaceId)
      .eq("tokenId", fromTokenId);
      
    const fromBalance = updatedFromTokens?.reduce((acc, curr) => acc + curr.creditRemaining, 0) || 0;

    const { data: updatedToTokens } = await supabase
      .from("credentialsWorkspaceToken")
      .select("creditRemaining")
      .eq("workspaceId", workspaceId)
      .eq("tokenId", toTokenId);
      
    const toBalance = updatedToTokens?.reduce((acc, curr) => acc + curr.creditRemaining, 0) || 0;

    // Insert usage logs
    const logs = [
      {
        workspaceAlias,
        tokenId: fromTokenId,
        creditAmount: fromAmount,
        activityBy,
        activity: "debit (conversion)",
        creditBalance: fromBalance,
      },
      {
        workspaceAlias,
        tokenId: toTokenId,
        creditAmount: toAmount,
        activityBy,
        activity: "credit (conversion)",
        creditBalance: toBalance,
      }
    ];

    const { error: logError } = await supabase
      .from("credentialTokenUsageHistory")
      .insert(logs);

    if (logError) {
      throw new Error(`Failed to insert usage logs: ${logError.message}`);
    }

    return NextResponse.json(
      { msg: "Conversion successful and logged successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred while processing the request." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
