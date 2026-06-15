"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheckIcon, UploadCloudIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/i18n/locale-provider";
import type { Dictionary } from "@/i18n/dictionaries";

import { addMomentAssetAction } from "../actions/moment-actions";

type SignatureResponse = {
  apiKey: string;
  cloudName: string;
  params: Record<string, number | string>;
  signature: string;
};

function isSignatureResponse(value: unknown): value is SignatureResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<SignatureResponse>;
  return (
    typeof candidate.apiKey === "string" &&
    typeof candidate.cloudName === "string" &&
    typeof candidate.signature === "string" &&
    !!candidate.params &&
    typeof candidate.params === "object"
  );
}

async function getUploadSignature(messages: Dictionary["moments"]) {
  const response = await fetch("/api/studio/cloudinary/sign", {
    body: JSON.stringify({}),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(messages.signatureError);
  }

  const payload: unknown = await response.json();

  if (!isSignatureResponse(payload)) {
    throw new Error(messages.malformedSignature);
  }

  return payload;
}

async function uploadToCloudinary(
  file: File,
  messages: Dictionary["moments"],
) {
  const signature = await getUploadSignature(messages);
  const formData = new FormData();

  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("signature", signature.signature);

  for (const [key, value] of Object.entries(signature.params)) {
    formData.append(key, String(value));
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
    {
      body: formData,
      method: "POST",
    }
  );

  if (!response.ok) {
    let providerMessage: string | null = null;

    try {
      const payload: unknown = await response.json();

      if (
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error &&
        typeof payload.error === "object" &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
      ) {
        providerMessage = payload.error.message;
      }
    } catch {
      providerMessage = null;
    }

    throw new Error(
      providerMessage
        ? `${file.name}: ${providerMessage}`
        : `${messages.providerRejected} ${file.name}.`
    );
  }

  return response.json() as Promise<unknown>;
}

export function MomentUploadPanel({ momentId }: { momentId: string }) {
  const { dictionary } = useI18n();
  const messages = dictionary.moments;
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(files);

    setIsUploading(true);
    setProgress(0);
    setStatus("uploading");
    setMessage(
      `${messages.uploading} ${selectedFiles.length} ${
        selectedFiles.length > 1 ? messages.images : messages.image
      }...`,
    );

    try {
      for (const [index, file] of selectedFiles.entries()) {
        const upload = await uploadToCloudinary(file, messages);
        const result = await addMomentAssetAction({ momentId, upload });

        if (!result.ok) {
          throw new Error(result.reason);
        }

        setProgress(((index + 1) / selectedFiles.length) * 100);
        setMessage(
          `${messages.uploaded} ${index + 1} ${
            dictionary.blog.of
          } ${selectedFiles.length} ${
            selectedFiles.length > 1 ? messages.images : messages.image
          }.`,
        );
      }

      setMessage(messages.uploadComplete);
      setStatus("success");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : messages.uploadFailed);
      setStatus("error");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Card className="border bg-card/80">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>{messages.uploadTitle}</CardTitle>
        <CardDescription>
          {messages.uploadDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <label
          htmlFor="moment-photo-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/50"
        >
          <span className="grid size-10 place-items-center rounded-full bg-background shadow-sm">
            <UploadCloudIcon className="size-5" />
          </span>
          <span className="text-sm font-medium">
            {messages.choosePhotos}
          </span>
          <span className="text-xs text-muted-foreground">
            {messages.uploadHint}
          </span>
          <Input
            id="moment-photo-upload"
            aria-label={messages.uploadAria}
            accept="image/*"
            className="sr-only"
            disabled={isUploading}
            multiple
            type="file"
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>

        {status === "uploading" ? (
          <Progress value={progress} aria-label={messages.uploadProgress} />
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p
            aria-live="polite"
            className={
              status === "error"
                ? "text-xs text-destructive"
                : "text-xs text-muted-foreground"
            }
          >
            {message ?? messages.noFiles}
          </p>
          <Badge variant="outline" className="w-fit">
            <ShieldCheckIcon className="size-3.5" />
            {messages.signedUpload}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
