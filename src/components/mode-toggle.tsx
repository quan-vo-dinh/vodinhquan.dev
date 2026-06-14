"use client";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

type ModeToggleProps = ComponentPropsWithoutRef<typeof Button>;

export const ModeToggle = forwardRef<HTMLButtonElement, ModeToggleProps>(
  ({ className, onClick, ...props }, ref) => {
    const { theme, setTheme } = useTheme();

    return (
      <Button
        ref={ref}
        type="button"
        variant="link"
        size="icon"
        className={cn(className)}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        onClick={(event) => {
          onClick?.(event);

          if (!event.defaultPrevented) {
            setTheme(theme === "dark" ? "light" : "dark");
          }
        }}
        {...props}
      >
        {theme === "dark" ? (
          <SunIcon className="h-full w-full" />
        ) : (
          <MoonIcon className="h-full w-full" />
        )}
      </Button>
    );
  }
);

ModeToggle.displayName = "ModeToggle";
