import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TreeItem } from "@/lib/types";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";
import React from "react";

interface FileExplorerListProps {
  data: TreeItem[];
  value?: string | null;
  onSelect?: (value: string) => void;
}

interface TreeProps {
  item: TreeItem;
  selectedValue?: string | null;
  onSelect?: (value: string) => void;
  parentPath: string;
}

const FileExplorerList = ({ data, value, onSelect }: FileExplorerListProps) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, index) => (
                  <List
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
};

export default FileExplorerList;

const List = ({ item, selectedValue, onSelect, parentPath }: TreeProps) => {
  const [name, ...items] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;

  if (!items.length) {
    const isSelected = selectedValue === currentPath;

    return (
      <SidebarMenuButton
        isActive={isSelected}
        onClick={() => onSelect?.(currentPath)}
      >
        <FileIcon />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRightIcon className="transition-transform" />
            <FolderIcon />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item, index) => (
              <List
                key={index}
                item={item}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};
