import React from "react";

interface PageProps {
  params: Promise<{ projectId: string }>;
}
const Page = async ({ params }: PageProps) => {
  const projectId = (await params).projectId;
  return <div>Page: {projectId}</div>;
};

export default Page;
