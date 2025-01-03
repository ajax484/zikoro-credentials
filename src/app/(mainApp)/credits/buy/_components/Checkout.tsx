"use client";
import { Button } from "@/components/ui/button";
import { paymentConfig } from "@/hooks/common/usePayStackPayment";
import { useMutateData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/organization";
import { CredentialCurrencyConverter, CredentialsToken } from "@/types/token";
import {
  applyCredentialsDiscount,
  generateAlphanumericHash,
} from "@/utils/helpers";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { PaystackButton } from "react-paystack";

const Checkout = ({
  workspace,
  credits,
  tokens,
  currencyConversion,
  selectedCurrency,
}: {
  workspace: TOrganization | null;
  credits: {
    bronze: number;
    silver: number;
    gold: number;
  };
  tokens: CredentialsToken[];
  currencyConversion: CredentialCurrencyConverter[];
  selectedCurrency: string;
}) => {
  const { user } = useUserStore();
  const { mutateData, isLoading: mutateLoading } = useMutateData(
    `/workspaces/credits/buy`
  );

  const router = useRouter();

  const currentCurrency = currencyConversion.find(
    ({ currency }) => currency === selectedCurrency
  ) || { amount: 0, currency: "" };

  const bronzeToken = tokens.find(({ id }) => id === 1) || { amount: 0 };
  const silverToken = tokens.find(({ id }) => id === 2) || { amount: 0 };
  const goldToken = tokens.find(({ id }) => id === 3) || { amount: 0 };

  const total =
    applyCredentialsDiscount(
      credits.gold,
      currentCurrency?.amount * goldToken?.amount
    ) +
    applyCredentialsDiscount(
      credits.silver,
      currentCurrency?.amount * silverToken?.amount
    ) +
    applyCredentialsDiscount(
      credits.bronze,
      currentCurrency?.amount * bronzeToken?.amount
    );

  const config = paymentConfig({
    reference:
      workspace?.organizationAlias + "-" + generateAlphanumericHash(12),
    email: user?.userEmail,
    amount: total,
    currency: currentCurrency.currency,
  });

  const handleSuccess = async (info: any) => {
    console.log(info);
    await mutateData({
      payload: {
        credits: {
          bronze: {
            amount: credits.bronze,
            price: currentCurrency.amount * bronzeToken.amount,
          },
          silver: {
            amount: credits.silver,
            price: currentCurrency.amount * silverToken.amount,
          },
          gold: {
            amount: credits.gold,
            price: currentCurrency.amount * goldToken.amount,
          },
        },
        workspaceId: workspace?.id,
        email: user?.userEmail,
        name: user?.firstName,
        workspaceName: workspace?.organizationName,
        reference: info.reference,
        currency: currentCurrency.currency,
        workspaceAlias: workspace?.organizationAlias,
        activityBy: user?.id,
      },
    });

    router.push("/designs");
  };

  const componentProps: any = {
    ...config,
    children: (
      <Button className="w-full sm:w-[405px] gap-x-2 bg-basePrimary text-gray-50 font-medium">
        <Lock size={22} />
        <span>{`Pay NGN ${Number(total)?.toLocaleString()}`}</span>
      </Button>
    ),
    onSuccess: (reference: any) => handleSuccess(reference),
  };

  return (
    <section className="w-full space-y-6">
      <h1 className="text-center font-bold text-gray-800">Order Summary</h1>
      <div className="flex flex-col gap-4 bg-blue-100 p-6 rounded-lg border w-1/2 mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Workspace</span>
          <span className="text-gray-700">{workspace?.organizationName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Email</span>
          <span className="text-gray-700">{user?.userEmail}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700">Bronze</span>
          <span className="text-gray-700">
            {selectedCurrency}
            {applyCredentialsDiscount(
              credits.bronze,
              currentCurrency?.amount * bronzeToken?.amount
            ).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Silver</span>
          <span className="text-gray-700">
            {selectedCurrency}
            {applyCredentialsDiscount(
              credits.silver,
              currentCurrency?.amount * silverToken?.amount
            ).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Gold</span>
          <span className="text-gray-700">
            {selectedCurrency}
            {applyCredentialsDiscount(
              credits.gold,
              currentCurrency?.amount * goldToken?.amount
            ).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700">Total</span>
          <span className="text-gray-700">
            {selectedCurrency}
            {Number(total).toLocaleString()}
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center">
        <PaystackButton
          {...componentProps}
          className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex
        items-center justify-center rounded-lg py-2 px-8 w-fit mx-auto"
        />
      </div>
    </section>
  );
};

export default Checkout;
