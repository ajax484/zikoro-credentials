import { UserSchema } from "@/schemas/user";
import { z } from "zod";
import { TAttendee } from "@/types";

// Optional: You can use the following line to enforce strict typing
export type TUser = z.infer<typeof UserSchema> & {
  id: number;
  referralCode: string;
  freeCreditClaimed: boolean;
  completedCredentialWorkthrough: {
    dashboardTour: boolean;
  };
  allowNewWorkspace: boolean;
};

type User = {
  email: string;
  created_at: string;
  email_confirmed_at: string;
  id: string;
};
export interface TAuthUser {
  user: User;
}

export interface TUserAccess {
  isOrganizer?: boolean;
  isTeamMember?: boolean;
  attendeeId?: number;
  attendee?: TAttendee;
}

export interface UserFeedback {
  id: string;
  comment: string;
  ratings: number;
  platform: string;
  userId: number;
  created_at: string;
}
