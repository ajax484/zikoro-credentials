import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TCertificate } from "@/types/certificates";
import React from "react";

const Excel = ({ certificate }: { certificate: TCertificate }) => {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Assign {certificate?.name}</DialogTitle>
      </DialogHeader>
      
    </DialogContent>
  );
};

export default Excel;
