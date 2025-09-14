import { TRPCReactProvider } from "@/trpc/client";
import React from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <TRPCReactProvider>{children}</TRPCReactProvider>;
};

export default Providers;
