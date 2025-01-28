"use client";
import { toast } from "react-hot-toast"; // Changed from react-toastify to react-hot-toast to keep consistency
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

//create user Organization
export function useCreateUserOrganization(
) {
    async function createUserOrganization(
        orgName: string,
        username: string,
        phone: string,
        country: string,
        email: string,
        alias: string

    ) {
        try {
            const { data, error, status } = await supabase
                .from("organization")
                .insert({
                    organizationName: orgName,
                    organizationOwner: username,
                    subscriptionPlan: 'free',
                    eventPhoneNumber: phone,
                    country: country,
                    eventContactEmail: email,
                    organizationAlias: alias
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
        alias: string,
        id: number) {
        try {
            const { error, status } = await supabase
                .from("organization")
                .update({ organizationOwnerId: id })
                .eq("organizationAlias", alias);

            if (error) {
                console.log(error.message);
                return;
            }
            if (status === 204 || status === 200) {
                console.log("Organization updated successfully");
            }
        } catch (error) { }
    }

    return {
        updateOrganization,
    };
}



export function useCreateTeamMember(
) {
    async function createTeamMember(
        userId: number,
        userEmail: string,
        workspaceAlias: string
    ) {
        try {
            console.log('id', userId)
            console.log('email', userEmail)
            console.log('alias', workspaceAlias)
            const { data, error, status } = await supabase
                .from("organizationTeamMembers")
                .insert({
                    userId: userId,
                    userEmail: userEmail,
                    userRole: "Owner",
                    workspaceAlias: workspaceAlias,
                })

            if (error) {
                toast.error(error.message);
                return;
            }
            if (status === 204 || status === 200) {
                console.log("Organization created successfully");
            }
        } catch (error) {
            console.log('error creating team members')
        }
    }

    return {
        createTeamMember,
    };
}