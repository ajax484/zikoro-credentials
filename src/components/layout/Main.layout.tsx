"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 2,
      },
    },
  });

  return (
    
    <QueryClientProvider client={queryClient}>
      {children}
      </QueryClientProvider>
  );
};

export default MainLayout;
