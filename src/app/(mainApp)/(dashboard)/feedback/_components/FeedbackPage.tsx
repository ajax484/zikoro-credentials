"use client";
import { useState } from "react";
import { ThumbUp } from "styled-icons/material-rounded";
import { FeedBackComp } from "./FeedbackComp";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function FeedBack() {
  const [showSuccess, setShowSuccess] = useState(false);

  function onClose() {
    setShowSuccess((prev) => !prev);
  }
  return (
    <div className="w-full max-w-xl m-auto min-h-screen flex flex-col items-start justify-center gap-y-4 py-8 sm:py-10 px-4 sm:px-6">
      <Dialog open={!showSuccess} onOpenChange={onClose}>
        <DialogContent>
          <FeedBackComp close={onClose} />
        </DialogContent>
      </Dialog>
      <div className="w-full bg-white rounded-lg h-[40vh] shadow flex flex-col items-center justify-center gap-y-3">
        <ThumbUp size={36} className="text-basePrimary" />
        <div className="text-center text-lg sm:text-3xl font-semibold">
          Thank you for your feedback!
        </div>
      </div>
    </div>
  );
}