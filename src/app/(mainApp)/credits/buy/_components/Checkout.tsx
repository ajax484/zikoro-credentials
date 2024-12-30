"use client"
import { Button } from "@/components/ui/button";
import { paymentConfig } from "@/hooks/common/usePayStackPayment";
import { useMutateData } from "@/hooks/services/request";
import { TOrganization } from "@/types/organization";
import { generateAlphanumericHash } from "@/utils/helpers";
import { Lock } from "lucide-react";
import React from "react";
import { PaystackButton } from "react-paystack";

const Checkout = ({
  workspace,
  credits,
  prices,
}: {
  workspace: TOrganization | null;
  credits: {
    bronze: number;
    silver: number;
    gold: number;
  };
  prices: {
    bronze: number;
    silver: number;
    gold: number;
  };
}) => {
  const { mutateData, isLoading: mutateLoading } = useMutateData(
    `/workspaces/credits/buy`
  );

  const total =
    credits.bronze * prices.bronze +
    credits.silver * prices.silver +
    credits.gold * prices.gold;

  const config = paymentConfig({
    reference: workspace?.organizationAlias + "-" + generateAlphanumericHash(12),
    email: workspace?.eventContactEmail,
    amount: total,
    currency: "NGN",
  });

  const handleSuccess = async (reference: any) => {
    await mutateData({
      payload: {
        credits: {
          bronze: {
            amount: credits.bronze,
            price: prices.bronze,
          },
          silver: {
            amount: credits.silver,
            price: prices.silver,
          },
          gold: {
            amount: credits.gold,
            price: prices.gold,
          },
        },
        workspaceId: workspace?.id,
        email: workspace?.eventContactEmail,
        name: workspace?.organizationName,
      },
    });
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
          <span className="text-gray-700">{workspace?.eventContactEmail}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-700">Bronze</span>
          <span className="text-gray-700">
            NGN{credits.bronze * prices.bronze}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Silver</span>
          <span className="text-gray-700">
            NGN{credits.silver * prices.silver}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Gold</span>
          <span className="text-gray-700">NGN{credits.gold * prices.gold}</span>
        </div>
        <div className="flex justify-between items-center font-bold">
          <span className="text-gray-700">Total</span>
          <span className="text-gray-700">
            NGN
            {Number(
              credits.bronze * prices.bronze +
                credits.silver * prices.silver +
                credits.gold * prices.gold
            ).toLocaleString()}
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
