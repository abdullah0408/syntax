"use client";

import React from "react";
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useCurrentTheme } from "@/hooks/use-current-theme";

const lightThemeVariables = {
  colorPrimary: "oklch(0.5854 0.2041 277.1173)",
  colorPrimaryForeground: "oklch(1.0000 0 0)",
  colorBackground: "oklch(0.9232 0.0026 48.7171)",
  colorWarning: "oklch(0.9376 0.0260 321.9388)",
  colorBorder: "oklch(0.28 0.0043 56.3660)",
  colorDanger: "oklch(0.6368 0.2078 25.3313)",
  colorForeground: "oklch(0.2795 0.0368 260.0310)",
  colorInput: "oklch(0.8687 0.0043 56.3660)",
  colorInputForeground: "oklch(0.2795 0.0368 260.0310)",
  colorMuted: "oklch(0.9232 0.0026 48.7171)",
  colorMutedForeground: "oklch(0.5510 0.0234 264.3637)",
  colorRing: "oklch(0.5854 0.2041 277.1173)",
};

const darkThemeVariables = {
  colorPrimary: "oklch(0.6801 0.1583 276.9349)",
  colorPrimaryForeground: "oklch(0.2244 0.0074 67.4370)",
  colorBackground: "oklch(0.2244 0.0074 67.4370)",
  colorWarning: "oklch(0.3896 0.0074 59.4734)",
  colorBorder: "oklch(0.8 0.0077 59.4197)",
  colorDanger: "oklch(0.6368 0.2078 25.3313)",
  colorForeground: "oklch(0.9288 0.0126 255.5078)",
  colorInput: "oklch(0.3359 0.0077 59.4197)",
  colorInputForeground: "oklch(0.9288 0.0126 255.5078)",
  colorMuted: "oklch(0.2801 0.0080 59.3379)",
  colorMutedForeground: "oklch(0.7137 0.0192 261.3246)",
  colorRing: "oklch(0.6801 0.1583 276.9349)",
};

const Page = () => {
  const currentTheme = useCurrentTheme();

  return (
    <SignUp
      appearance={{
        baseTheme: currentTheme === "dark" ? dark : undefined,
        elements: {
          cardBox: "!border !shadow-none !rounded-lg",
        },
        variables:
          currentTheme === "dark" ? darkThemeVariables : lightThemeVariables,
      }}
    />
  );
};

export default Page;
