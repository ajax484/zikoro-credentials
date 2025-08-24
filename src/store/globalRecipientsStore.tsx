import { RecipientType } from "@/app/(mainApp)/(dashboard)/designs/certificate/[alias]/issue/_components/Recipients";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type recipientStore = {
  recipients: RecipientType;
  setRecipients: (recipients: RecipientType) => void;
};

export const useRecipientsStore = create<recipientStore>()(
  persist(
    (set) => ({
      recipients: [],
      setRecipients: (recipients: RecipientType) => set({ recipients }),
    }),
    {
      name: "recipients",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
