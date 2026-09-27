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
import type { Dictionary } from "@/i18n/dictionaries";
import { useI18n } from "@/i18n/locale-provider";

import { addMomentAssetAction } from "../actions/moment-actions";
import {
  MOMENT_UPLOAD_ACCEPTED_TYPES,
  MOMENT_UPLOAD_CONCURRENCY,
  MOMENT_UPLOAD_MAX_FILES,
  getMomentUploadFileError,
} from "../lib/moment-upload-policy";
import { mapWithConcurrency, retryAsync } from "../lib/moment-upload-queue";

type SignatureResponse = {
  apiKey: string;
  cloudName: string;
  params: Record<string, boolean | number | string>;
  signature: string;
};

type UploadFileState = {
  error?: string;
  id: string;
  name: string;
  status: "complete" | "failed" | "queued" | "saving" | "uploaded" | "uploading";
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

function createUploadId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function getRetryWait(attempt: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, attempt * 350);
  });
}

async function getUploadSignature(
  messages: Dictionary["moments"],
  publicId: string
) {
  const response = await fetch("/api/studio/cloudinary/sign", {
    body: JSON.stringify({ publicId }),
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
  publicId: string
) {
  const signature = await getUploadSignature(messages, publicId);
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

function getFileStatusLabel(
  status: UploadFileState["status"],
  messages: Dictionary["moments"]
) {
  switch (status) {
    case "complete":
      return messages.uploaded;
    case "failed":
      return messages.uploadFailed;
    case "saving":
      return messages.uploadSaving;
    case "uploaded":
      return messages.uploaded;
    case "uploading":
      return messages.uploading;
    case "queued":
      return messages.uploading;
    default:
      return messages.noFiles;
  }
}

function getFileValidationMessage(
  error: ReturnType<typeof getMomentUploadFileError>,
  messages: Dictionary["moments"]
) {
  return error === "file-too-large"
    ? messages.uploadLimitSize
    : messages.uploadUnsupported;
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
  const [files, setFiles] = useState<UploadFileState[]>([]);

  function updateFile(id: string, update: Partial<UploadFileState>) {
    setFiles((currentFiles) =>
      currentFiles.map((file) =>
        file.id === id ? { ...file, ...update } : file
      )
    );
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const selectedFiles = Array.from(fileList);

    if (selectedFiles.length > MOMENT_UPLOAD_MAX_FILES) {
      setStatus("error");
      setMessage(
        messages.uploadLimitFiles.replace(
          "{count}",
          String(MOMENT_UPLOAD_MAX_FILES)
        )
      );
      return;
    }

    const validationError = selectedFiles
      .map((file) => ({ error: getMomentUploadFileError(file), file }))
      .find((candidate) => candidate.error);

    if (validationError) {
      setStatus("error");
      setMessage(getFileValidationMessage(validationError.error, messages));
      return;
    }

    const initialFileStates = selectedFiles.map((file, index) => ({
      id: `${index}-${file.name}-${file.lastModified}`,
      name: file.name,
      status: "queued" as const,
    }));

    setFiles(initialFileStates);
    setIsUploading(true);
    setProgress(0);
    setStatus("uploading");
    setMessage(
      `${messages.uploading} ${selectedFiles.length} ${
        selectedFiles.length > 1 ? messages.images : messages.image
      }...`
    );

    const uploadResults = await mapWithConcurrency(
      selectedFiles,
      MOMENT_UPLOAD_CONCURRENCY,
      async (file, index) => {
        const fileState = initialFileStates[index];
        const publicId = createUploadId();

        updateFile(fileState.id, { status: "uploading" });
        const upload = await retryAsync(
          () => uploadToCloudinary(file, messages, publicId),
          { wait: getRetryWait }
        );
        updateFile(fileState.id, { status: "uploaded" });

        return { fileState, publicId, upload };
      }
    );

    let completed = 0;
    let failed = 0;
    let processed = 0;

    for (const uploadResult of uploadResults) {
      processed += 1;

      if (uploadResult.status === "rejected") {
        const failedFile = initialFileStates[processed - 1];
        const error =
          uploadResult.reason instanceof Error
            ? uploadResult.reason.message
            : messages.uploadFailed;

        updateFile(failedFile.id, { error, status: "failed" });
        failed += 1;
        setProgress((processed / selectedFiles.length) * 100);
        continue;
      }

      const { fileState, upload } = uploadResult.value;

      try {
        updateFile(fileState.id, { status: "saving" });
        const result = await retryAsync(
          () => addMomentAssetAction({ momentId, upload }),
          { wait: getRetryWait }
        );

        if (!result.ok) {
          throw new Error(result.reason);
        }

        updateFile(fileState.id, { status: "complete" });
        completed += 1;
      } catch (error) {
        updateFile(fileState.id, {
          error: error instanceof Error ? error.message : messages.uploadFailed,
          status: "failed",
        });
        failed += 1;
      }

      setProgress((processed / selectedFiles.length) * 100);
    }

    if (completed > 0) {
      router.refresh();
    }

    if (failed > 0) {
      setMessage(
        `${messages.uploadFailed} ${completed} ${dictionary.blog.of} ${selectedFiles.length}.`
      );
      setStatus("error");
    } else {
      setMessage(messages.uploadComplete);
      setStatus("success");
    }

    setIsUploading(false);
  }

  return (
    <Card className="border bg-card/80">
      <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
        <CardTitle>{messages.uploadTitle}</CardTitle>
        <CardDescription>{messages.uploadDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
        <label
          htmlFor="moment-photo-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/30 px-6 py-8 text-center transition-colors hover:bg-muted/50"
        >
          <span className="grid size-10 place-items-center rounded-full bg-background shadow-sm">
            <UploadCloudIcon className="size-5" />
          </span>
          <span className="text-sm font-medium">{messages.choosePhotos}</span>
          <span className="text-xs text-muted-foreground">{messages.uploadHint}</span>
          <Input
            id="moment-photo-upload"
            aria-label={messages.uploadAria}
            accept={MOMENT_UPLOAD_ACCEPTED_TYPES.join(",")}
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

        {files.length > 0 ? (
          <ul className="grid gap-2" aria-label={messages.uploadProgress}>
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs"
                title={file.error}
              >
                <span className="min-w-0 truncate text-muted-foreground">
                  {file.name}
                </span>
                <Badge
                  className="shrink-0"
                  variant={
                    file.status === "failed"
                      ? "destructive"
                      : file.status === "complete"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {getFileStatusLabel(file.status, messages)}
                </Badge>
              </li>
            ))}
          </ul>
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
