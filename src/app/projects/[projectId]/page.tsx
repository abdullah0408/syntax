import ProjectView from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React, { Suspense } from "react";

interface PageProps {
  params: Promise<{ projectId: string }>;
}
const Page = async ({ params }: PageProps) => {
  const projectId = (await params).projectId;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );
  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<p>Loading...</p>}>
        <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
