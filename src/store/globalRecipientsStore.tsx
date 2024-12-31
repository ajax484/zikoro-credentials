import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type recipient = {
  recipientFirstName: string;
  recipientLastName: string;
  recipientEmail: string;
};

type recipientStore = {
  recipients: recipient[];
  setRecipients: (recipients: recipient[]) => void;
};

export const useRecipientsStore = create<recipientStore>()(
  persist(
    (set) => ({
      recipients: [],
      setRecipients: (recipients: recipient[]) => set({ recipients }),
    }),
    {
      name: "recipients",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
