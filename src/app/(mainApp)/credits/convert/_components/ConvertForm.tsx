"use client";
import React from "react";
import { TOrganization } from "@/types/organization";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFetchWorkspaceCredits } from "@/queries/credits.queries";

const tokenMap: Record<number, string> = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
};

const ConvertForm = ({
  handleNext,
  workspace,
  fromType,
  toType,
  amount,
  setFromType,
  setToType,
  setAmount,
}: {
  handleNext: () => void;
  workspace: TOrganization | null;
  fromType: number;
  toType: number;
  amount: number;
  setFromType: (v: number) => void;
  setToType: (v: number) => void;
  setAmount: (v: number) => void;
}) => {
  const { data: credits, isFetching } = useFetchWorkspaceCredits(workspace?.id!);

  const creditBalance = {
    1: credits?.filter((v) => v.tokenId === 1).reduce((acc, curr) => acc + curr.creditRemaining, 0) || 0,
    2: credits?.filter((v) => v.tokenId === 2).reduce((acc, curr) => acc + curr.creditRemaining, 0) || 0,
    3: credits?.filter((v) => v.tokenId === 3).reduce((acc, curr) => acc + curr.creditRemaining, 0) || 0,
  };

  const getToAmount = () => {
    const baseVal = fromType === 1 ? 1 : fromType === 2 ? 2 : 4;
    const toBaseVal = toType === 1 ? 1 : toType === 2 ? 2 : 4;
    return (amount * baseVal) / toBaseVal;
  };

  const toAmount = getToAmount();
  const isValidAmount = amount > 0 && amount <= creditBalance[fromType as 1|2|3] && Number.isInteger(toAmount);

  return (
    <section className="space-y-6 w-full">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg mb-4 text-center">Current Balances</h3>
        {isFetching ? (
          <div className="text-center">Loading balances...</div>
        ) : (
          <div className="flex justify-around">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-sm">Bronze</span>
              <span className="font-bold text-xl">{creditBalance[1]}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-sm">Silver</span>
              <span className="font-bold text-xl">{creditBalance[2]}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-sm">Gold</span>
              <span className="font-bold text-xl">{creditBalance[3]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Convert From</label>
            <Select value={String(fromType)} onValueChange={(val) => setFromType(Number(val))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Bronze</SelectItem>
                <SelectItem value="2">Silver</SelectItem>
                <SelectItem value="3">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Convert To</label>
            <Select value={String(toType)} onValueChange={(val) => setToType(Number(val))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1" disabled={fromType === 1}>Bronze</SelectItem>
                <SelectItem value="2" disabled={fromType === 2}>Silver</SelectItem>
                <SelectItem value="3" disabled={fromType === 3}>Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">Amount to Convert</label>
          <Input 
            type="number" 
            min={0} 
            value={amount || ""} 
            onChange={(e) => setAmount(Number(e.target.value))} 
            className="bg-white"
            placeholder="Enter amount"
          />
          {amount > creditBalance[fromType as 1|2|3] && (
            <span className="text-red-500 text-sm">Insufficient balance.</span>
          )}
        </div>
      </div>

      {amount > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
          <div className="text-blue-900">
            You will receive:
          </div>
          <div className="font-bold text-2xl text-blue-900">
            {toAmount} {tokenMap[toType as 1|2|3]}
          </div>
        </div>
      )}

      {amount > 0 && !Number.isInteger(toAmount) && (
        <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded border border-amber-200">
          Conversion results in a fractional amount. Please adjust the input amount so the result is a whole number.
        </div>
      )}

      <Button
        disabled={!isValidAmount || fromType === toType}
        onClick={handleNext}
        className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-8 w-fit mx-auto"
      >
        Proceed
      </Button>
    </section>
  );
};

export default ConvertForm;
