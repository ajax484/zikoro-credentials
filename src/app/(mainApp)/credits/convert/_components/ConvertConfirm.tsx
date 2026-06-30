"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { useMutateData } from "@/hooks/services/request";
import useUserStore from "@/store/globalUserStore";
import { TOrganization } from "@/types/organization";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const tokenMap: Record<number, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
};

const ConvertConfirm = ({
  workspace,
  fromType,
  toType,
  amount,
}: {
  workspace: TOrganization | null;
  fromType: number;
  toType: number;
  amount: number;
}) => {
  const { user } = useUserStore();
  const { mutateData, isLoading } = useMutateData(
    `/workspaces/${workspace?.id}/credits/convert`
  );

  const router = useRouter();

  const getToAmount = () => {
    const baseVal = fromType === 1 ? 1 : fromType === 2 ? 2 : 4;
    const toBaseVal = toType === 1 ? 1 : toType === 2 ? 2 : 4;
    return (amount * baseVal) / toBaseVal;
  };
  
  const toAmount = getToAmount();

  const handleConvert = async () => {
    try {
      await mutateData({
        payload: {
          workspaceAlias: workspace?.organizationAlias,
          activityBy: user?.id,
          fromTokenId: fromType,
          toTokenId: toType,
          fromAmount: amount,
          toAmount: toAmount,
        },
      });
      toast.success("Credits converted successfully!");
      router.push("/designs");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <section className="w-full space-y-6">
      <h1 className="text-center font-bold text-gray-800">Conversion Summary</h1>
      <div className="flex flex-col gap-4 bg-blue-100 p-6 rounded-lg border md:w-1/2 mx-auto">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Workspace</span>
          <span className="font-semibold text-gray-900">{workspace?.organizationName}</span>
        </div>
        <hr className="border-blue-200" />
        <div className="flex justify-between items-center text-red-600">
          <span>Converting From</span>
          <span className="font-bold">
            - {amount} {tokenMap[fromType]}
          </span>
        </div>
        <div className="flex justify-between items-center text-green-600">
          <span>Converting To</span>
          <span className="font-bold">
            + {toAmount} {tokenMap[toType]}
          </span>
        </div>
      </div>

      <div className="w-full flex justify-center pt-4">
        <Button
          disabled={isLoading}
          onClick={handleConvert}
          className="bg-basePrimary text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-8 w-fit mx-auto"
        >
          {isLoading ? "Converting..." : "Confirm Conversion"}
        </Button>
      </div>
    </section>
  );
};

export default ConvertConfirm;
