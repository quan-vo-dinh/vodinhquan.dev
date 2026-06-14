import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRightIcon,
  CameraIcon,
  FolderKanbanIcon,
  ImagePlusIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";

import { Icons } from "@/components/icons";
import BlurFade from "@/components/magicui/blur-fade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DraggableCardBody,
  DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { getOwnerAuthUser } from "@/features/auth/lib/get-owner-auth-user";
import { getServerEnv } from "@/lib/env";
import { getCachedAuthUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio",
  robots: {
    index: false,
    follow: false,
  },
};

const STUDIO_ROUTES = [
  {
    description: "Review drafts, edit metadata, upload photos, and publish.",
    href: "/studio/moments",
    icon: CameraIcon,
    label: "Moments manager",
  },
  {
    description: "Start a new photo-first collection with title and metadata.",
    href: "/studio/moments/new",
    icon: ImagePlusIcon,
    label: "Create moment",
  },
  {
    description: "See the public gallery exactly as visitors see it.",
    href: "/moments",
    icon: ArrowUpRightIcon,
    label: "Public moments",
  },
];

const BLUR_FADE_DELAY = 0.04;
const STUDIO_SIGN_IN_PATH = "/auth/sign-in/github?next=%2Fstudio";
const SIGN_OUT_PATH = "/auth/sign-out";

export default async function StudioPage() {
  const owner = await getOwnerAuthUser();

  if (!owner) {
    const {
      data: { user },
    } = await getCachedAuthUser();

    return (
      <StudioSignInGate
        isSignedIn={Boolean(user)}
        ownerGitHubUsername={getServerEnv().siteOwnerGitHubUsername}
        signedInEmail={user?.email ?? null}
      />
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Studio
            </h1>
            <Badge variant="secondary">Owner only</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            A private workspace for shaping the personal site. Keep publishing
            tools small, explicit, and close to the public routes they affect.
          </p>
        </div>
      </BlurFade>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <Card className="border bg-card/80">
            <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardTitle>Routes</CardTitle>
              <CardDescription>
                Pick the owner surface you want to work with.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:p-6">
              {STUDIO_ROUTES.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className="group flex items-start gap-3 rounded-2xl border bg-background/60 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl border bg-card text-muted-foreground transition-colors group-hover:text-foreground">
                    <route.icon className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-medium tracking-tight">
                      {route.label}
                    </span>
                    <span className="text-sm leading-5 text-muted-foreground">
                      {route.description}
                    </span>
                  </span>
                  <ArrowUpRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </BlurFade>

        <BlurFade delay={BLUR_FADE_DELAY * 3}>
          <DraggableCardContainer className="hidden lg:block">
            <DraggableCardBody className="min-h-80 w-full cursor-grab rounded-3xl border border-border bg-card/90 p-5 active:cursor-grabbing">
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <FolderKanbanIcon className="size-5" />
                  </span>
                  <Badge variant="outline">drag preview</Badge>
                </div>
                <div className="flex flex-col gap-3">
                  <SparklesIcon className="size-5 text-muted-foreground" />
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      Moments workspace
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The playful card is only a visual accent; the real route
                      list stays predictable and keyboard-friendly.
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="w-fit">
                  <Link href="/studio/moments">Open Moments</Link>
                </Button>
              </div>
            </DraggableCardBody>
          </DraggableCardContainer>
        </BlurFade>
      </div>
    </section>
  );
}

function StudioSignInGate({
  isSignedIn,
  ownerGitHubUsername,
  signedInEmail,
}: {
  isSignedIn: boolean;
  ownerGitHubUsername: string;
  signedInEmail: string | null;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <Card className="mx-auto w-full overflow-hidden border bg-card/85">
          <CardHeader className="border-b p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Owner only</Badge>
              <Badge variant="outline">GitHub required</Badge>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="grid size-12 place-items-center rounded-2xl border bg-background text-muted-foreground">
                <LockKeyholeIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl tracking-tight sm:text-3xl">
                  Studio is private
                </CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-sm leading-6">
                  This workspace controls publishing tools for the personal
                  site. Access is limited to the GitHub owner id{" "}
                  <code className="rounded-md border bg-background px-1.5 py-0.5 text-foreground">
                    {ownerGitHubUsername}
                  </code>
                  .
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-5 p-5 sm:p-6">
            {isSignedIn ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm leading-6 text-muted-foreground">
                You are signed in
                {signedInEmail ? ` as ${signedInEmail}` : ""}, but this GitHub
                session is not authorized for Studio. Sign out first if you need
                to switch to the owner account.
              </div>
            ) : (
              <div className="rounded-2xl border bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
                Sign in with GitHub to continue. Non-owner accounts will remain
                blocked from the Studio routes.
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 sm:w-fit">
                <a href={STUDIO_SIGN_IN_PATH}>
                  <Icons.github
                    className="size-4 shrink-0"
                    data-icon="inline-start"
                  />
                  Login via GitHub
                </a>
              </Button>
              {isSignedIn ? (
                <form action={SIGN_OUT_PATH} method="post">
                  <Button
                    type="submit"
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 sm:w-fit"
                  >
                    Sign out current session
                  </Button>
                </form>
              ) : (
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <a
                    href={`https://github.com/${ownerGitHubUsername}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ShieldCheckIcon
                      className="size-4 shrink-0"
                      data-icon="inline-start"
                    />
                    View owner profile
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </BlurFade>
    </section>
  );
}
