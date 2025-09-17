"use client";

import React, { Suspense, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import MessagesContainer from "../components/messages-container";
import { Fragment } from "@/generated/prisma";
interface ProjectViewProps {
  projectId: string;
}

const ProjectView = ({ projectId }: ProjectViewProps) => {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={35}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <Suspense fallback={<p>Loading messages...</p>}>
            <MessagesContainer
              projectId={projectId}
              activeFragment={activeFragment}
              setActiveFragment={setActiveFragment}
            />
          </Suspense>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65} minSize={50}></ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ProjectView;
