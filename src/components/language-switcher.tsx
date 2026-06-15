"use client";

import { LanguagesIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/locale-provider";
import {
  serializeLocaleCookie,
  type Locale,
} from "@/i18n/locale";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const [isPending, setIsPending] = useState(false);
  const { dictionary, locale } = useI18n();
  const nextLocale: Locale = locale === "vi" ? "en" : "vi";
  const label =
    nextLocale === "en"
      ? dictionary.common.switchToEnglish
      : dictionary.common.switchToVietnamese;

  return (
    <Button
      type="button"
      variant="link"
      size="icon"
      className={cn("relative", className)}
      aria-label={label}
      title={label}
      disabled={isPending}
      onClick={() => {
        setIsPending(true);
        document.cookie = serializeLocaleCookie(nextLocale);
        window.location.reload();
      }}
    >
      <LanguagesIcon className="size-full" aria-hidden />
      <span className="absolute -bottom-0.5 -right-0.5 rounded bg-primary px-0.5 text-[7px] font-bold leading-3 text-primary-foreground">
        {nextLocale.toUpperCase()}
      </span>
    </Button>
  );
}
