"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";

export default function Home() {
  const [value, setValue] = React.useState("");

  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions());
  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={!value || invoke.isPending}
        onClick={() => invoke.mutate({ value })}
      >
        Invoke
      </Button>
    </div>
  );
}
