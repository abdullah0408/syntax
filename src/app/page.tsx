"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [value, setValue] = React.useState("");

  const router = useRouter();

  const trpc = useTRPC();
  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (error) => toast.error(error.message),
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
      },
    })
  );
  return (
    <div>
      <Input value={value} onChange={(e) => setValue(e.target.value)} />
      <Button
        disabled={!value || createProject.isPending}
        onClick={() => createProject.mutate({ value })}
      >
        Submit
      </Button>
    </div>
  );
}
