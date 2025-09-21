"use client";

import { Button } from "@/components/ui/button";
import UserControl from "@/components/user-control";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { SignedOut, SignInButton, SignUpButton, SignedIn } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  const isScrolled = useScroll();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <nav
      className={cn(
        "p-4 bg-transparent fixed top-0 left-0 right-0 transition-all duration-200 border-b border-transparent",
        isScrolled && "bg-background border-border z-50"
      )}
    >
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Syntax Logo" width={24} height={24} />
          <span className="font-semibold text-lg">Syntax</span>
        </Link>
        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-2">
            <UserControl showName />
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                resolvedTheme === "dark" ? setTheme("light") : setTheme("dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Sun className="size-5" />
              ) : (
                <Moon className="size-5" />
              )}
            </Button>
          </div>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
