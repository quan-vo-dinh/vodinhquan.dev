"use client";

import { EmojiPicker } from "frimousse";
import { SmilePlus } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/locale-provider";

import { insertEmojiAtSelection } from "../lib/emoji-insertion";

type MomentEmojiFieldProps = {
  className?: string;
  defaultValue?: string | null;
  id: string;
  label: string;
  multiline?: boolean;
  name: string;
  placeholder?: string;
  required?: boolean;
};

type Selection = {
  end: number | null;
  start: number | null;
};

export function MomentEmojiField({
  className,
  defaultValue,
  id,
  label,
  multiline = false,
  name,
  placeholder,
  required = false,
}: MomentEmojiFieldProps) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<Selection>({
    end: value.length,
    start: value.length,
  });
  const pendingCaretRef = useRef<number | null>(null);

  const getField = () => inputRef.current ?? textareaRef.current;

  const rememberSelection = () => {
    const field = getField();

    if (!field) {
      return;
    }

    selectionRef.current = {
      end: field.selectionEnd,
      start: field.selectionStart,
    };
  };

  const handleInput = (
    event: FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setValue(event.currentTarget.value);
    selectionRef.current = {
      end: event.currentTarget.selectionEnd,
      start: event.currentTarget.selectionStart,
    };
  };

  const handleEmojiSelect = (emoji: string) => {
    const result = insertEmojiAtSelection(
      value,
      emoji,
      selectionRef.current.start,
      selectionRef.current.end,
    );

    pendingCaretRef.current = result.caret;
    selectionRef.current = {
      end: result.caret,
      start: result.caret,
    };
    setValue(result.value);
    setOpen(false);
  };

  const handleCloseAutoFocus = (event: Event) => {
    const caret = pendingCaretRef.current;

    if (caret === null) {
      return;
    }

    event.preventDefault();
    pendingCaretRef.current = null;

    requestAnimationFrame(() => {
      const field = getField();
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  };

  const sharedProps = {
    id,
    name,
    onClick: rememberSelection,
    onInput: handleInput,
    onKeyUp: rememberSelection,
    placeholder,
    required,
    value,
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-7 items-center justify-between gap-3">
        <label className="text-sm font-medium" htmlFor={id}>
          {label}
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-md text-muted-foreground"
              aria-label={`${dictionary.moments.addEmojiTo} ${label.toLowerCase()}`}
              onPointerDown={rememberSelection}
            >
              <SmilePlus className="size-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden p-0"
            onCloseAutoFocus={handleCloseAutoFocus}
          >
            <div className="border-b px-3 py-2.5">
              <p className="text-sm font-medium">
                {dictionary.moments.addEmoji}
              </p>
              <p className="text-xs text-muted-foreground">
                {dictionary.moments.addEmojiHint}
              </p>
            </div>
            <EmojiPicker.Root
              className="flex h-80 min-h-0 flex-col"
              onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
            >
              <EmojiPicker.Search
                aria-label={dictionary.moments.searchEmoji}
                className="h-10 w-full border-b bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                placeholder={`${dictionary.moments.searchEmoji}...`}
              />
              <EmojiPicker.Viewport className="relative min-h-0 flex-1">
                <EmojiPicker.Loading className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                  {dictionary.moments.loadingEmoji}
                </EmojiPicker.Loading>
                <EmojiPicker.Empty className="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground">
                  {dictionary.moments.noEmoji}
                </EmojiPicker.Empty>
                <EmojiPicker.List
                  className="select-none pb-2"
                  components={{
                    CategoryHeader: ({ category, ...props }) => (
                      <div
                        className="bg-popover px-3 pb-1.5 pt-3 text-xs font-medium text-muted-foreground"
                        {...props}
                      >
                        {category.label}
                      </div>
                    ),
                    Row: ({ children, ...props }) => (
                      <div className="scroll-my-1 px-2" {...props}>
                        {children}
                      </div>
                    ),
                    Emoji: ({ emoji, ...props }) => (
                      <button
                        className="flex size-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[active]:bg-accent"
                        type="button"
                        {...props}
                      >
                        <span aria-hidden="true">{emoji.emoji}</span>
                      </button>
                    ),
                  }}
                />
              </EmojiPicker.Viewport>
            </EmojiPicker.Root>
          </PopoverContent>
        </Popover>
      </div>

      {multiline ? (
        <Textarea
          {...sharedProps}
          ref={textareaRef}
          className={cn(className)}
        />
      ) : (
        <Input {...sharedProps} ref={inputRef} className={cn(className)} />
      )}
    </div>
  );
}
