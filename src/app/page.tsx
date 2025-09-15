"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export default function Home() {
  const [value, setValue] = React.useState("");

  const trpc = useTRPC();
  const generateCode = useMutation(trpc.generateCode.mutationOptions());
  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={!value || generateCode.isPending}
        onClick={() => generateCode.mutate({ value })}
      >
        Generate Code
      </Button>
    </div>
  );
}
