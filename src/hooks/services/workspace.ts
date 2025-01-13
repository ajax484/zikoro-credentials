"use client";
import { toast } from "react-hot-toast"; // Changed from react-toastify to react-hot-toast to keep consistency
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

//create user Organization
export function useCreateUserOrganization(
) {
    async function createUserOrganization(
        orgName: string,
        username: string) {
        try {
            const { data, error, status } = await supabase
                .from("organization")
                .upsert({
                    // organizationOwnerId: userId,
                    organizationName: orgName,
                    organizationOwner: username,
                });

            if (error) {
                toast.error(error.message);
                return;
            }
            if (status === 204 || status === 200) {
                toast.success("Organization created successfully");
            }
        } catch (error) { }
    }

    return {
        createUserOrganization,
    };
}

//update Workspace Details 

export function useUpdateOrganization(
) {
    async function updateOrganization(
        orgName: string,
        username: string) {
        try {
            const { data, error, status } = await supabase
                .from("organization")
                .upsert({
                    // organizationOwnerId: userId,
                    organizationName: orgName,
                    organizationOwner: username,
                });

            if (error) {
                toast.error(error.message);
                return;
            }
            if (status === 204 || status === 200) {
                toast.success("Organization created successfully");
            }
        } catch (error) { }
    }

    return {
        updateOrganization,
    };
}