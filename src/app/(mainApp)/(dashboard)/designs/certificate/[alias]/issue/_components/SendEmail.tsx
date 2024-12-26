import { Button } from "@/components/ui/button";
import { TCertificate } from "@/types/certificates";
import React from "react";

const SendEmail = ({
  certificate,
  updatePage,
}: {
  certificate: TCertificate;
  updatePage: (page: number) => void;
}) => {
  return (
    <form className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-gray-800">
          Send {certificate?.name} to recipients
        </h1>
        <Button className="bg-basePrimary text-white" type="submit">
          Back
        </Button>
      </div>
      <div className="space-y-4">
        
      </div>
    </form>
  );
};

export default SendEmail;