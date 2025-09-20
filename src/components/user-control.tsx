"use client";

import { UserButton } from "@clerk/nextjs";
import React from "react";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";

interface UserControlProps {
  showName?: boolean;
}

const UserControl = ({ showName }: UserControlProps) => {
  const currentTheme = useCurrentTheme();
  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "!rounded-md",
          userButtonAvatarBox: "!rounded-md !size-8",
          userButtonTrigger: "!rounded-md",
        },
        baseTheme: currentTheme === "dark" ? dark : undefined,
      }}
      userProfileProps={{
        appearance: {
          baseTheme: currentTheme === "dark" ? dark : undefined,
        },
      }}
    />
  );
};

export default UserControl;
