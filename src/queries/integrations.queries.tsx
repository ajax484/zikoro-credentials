"use client";
import { Event } from "@/types/events";
import { CredentialsIntegration, Forms, Quiz } from "@/types/integrations";
import { TOrganization } from "@/types/organization";
import { PaginatedData } from "@/types/request";
import { getRequest } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export function useFetchForm(organizationId: string, formId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["form", organizationId, formId],
    queryFn: async () => {
      const { data, status } = await getRequest<Forms>({
        endpoint: `/workspaces/${organizationId}/forms/${formId}`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || null,
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchQuiz(organizationId: string, quizId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["quiz", organizationId, quizId],
    queryFn: async () => {
      const { data, status } = await getRequest<Forms>({
        endpoint: `/workspaces/${organizationId}/quizzes/${quizId}`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || null,
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchEvent(organizationId: string, eventId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["event", organizationId, eventId],
    queryFn: async () => {
      const { data, status } = await getRequest<Forms>({
        endpoint: `/workspaces/${organizationId}/event/${eventId}`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || null,
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchForms(organizationId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["forms", organizationId],
    queryFn: async () => {
      const { data, status } = await getRequest<Forms[]>({
        endpoint: `/workspaces/${organizationId}/forms`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || [],
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchEvents(organizationId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["events", organizationId],
    queryFn: async () => {
      const { data, status } = await getRequest<Event[]>({
        endpoint: `/workspaces/${organizationId}/events`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || [],
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchIntegrations(
  organizationId: string,
  pagination: { page: number; limit: number }
) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["integrations", organizationId],
    queryFn: async () => {
      const { data, status } = await getRequest<
        PaginatedData<CredentialsIntegration>
      >({
        endpoint: `/workspaces/${organizationId}/integrations?limit=${pagination.limit}&page=${pagination.page}`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || {
      total: 0,
      data: [],
    },
    isFetching,
    status,
    error,
    refetch,
  };
}

export function useFetchQuizzes(organizationId: string) {
  const { data, isFetching, status, error, refetch } = useQuery({
    queryKey: ["quizzes", organizationId],
    queryFn: async () => {
      const { data, status } = await getRequest<Quiz[]>({
        endpoint: `/workspaces/${organizationId}/quizzes`,
      });

      if (status !== 200) {
        toast.error(data.error);
        throw new Error(data.error);
      }

      console.log(data.data);

      return data.data;
    },
  });

  return {
    data: data || [],
    isFetching,
    status,
    error,
    refetch,
  };
}
