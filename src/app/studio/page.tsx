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
import { getServerI18n } from "@/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dictionary } = await getServerI18n();

  return {
    title: dictionary.studio.title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

const BLUR_FADE_DELAY = 0.04;
const STUDIO_SIGN_IN_PATH = "/auth/sign-in/github?next=%2Fstudio";
const SIGN_OUT_PATH = "/auth/sign-out";

export default async function StudioPage() {
  const { dictionary } = await getServerI18n();
  const owner = await getOwnerAuthUser();
  const studioRoutes = [
    {
      description: dictionary.studio.momentsManagerDescription,
      href: "/studio/moments",
      icon: CameraIcon,
      label: dictionary.studio.momentsManager,
    },
    {
      description: dictionary.studio.createMomentDescription,
      href: "/studio/moments/new",
      icon: ImagePlusIcon,
      label: dictionary.studio.createMoment,
    },
    {
      description: dictionary.studio.publicMomentsDescription,
      href: "/moments",
      icon: ArrowUpRightIcon,
      label: dictionary.studio.publicMoments,
    },
  ];

  if (!owner) {
    const {
      data: { user },
    } = await getCachedAuthUser();

    return (
      <StudioSignInGate
        isSignedIn={Boolean(user)}
        ownerGitHubUsername={getServerEnv().siteOwnerGitHubUsername}
        signedInEmail={user?.email ?? null}
        dictionary={dictionary}
      />
    );
  }

  return (
    <section className="flex flex-col gap-8">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {dictionary.studio.title}
            </h1>
            <Badge variant="secondary">{dictionary.studio.ownerOnly}</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {dictionary.studio.description}
          </p>
        </div>
      </BlurFade>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <BlurFade delay={BLUR_FADE_DELAY * 2}>
          <Card className="border bg-card/80">
            <CardHeader className="p-5 pb-0 sm:p-6 sm:pb-0">
              <CardTitle>{dictionary.studio.routesTitle}</CardTitle>
              <CardDescription>
                {dictionary.studio.routesDescription}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 sm:p-6">
              {studioRoutes.map((route) => (
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
                  <Badge variant="outline">
                    {dictionary.studio.dragPreview}
                  </Badge>
                </div>
                <div className="flex flex-col gap-3">
                  <SparklesIcon className="size-5 text-muted-foreground" />
                  <div>
                    <h2 className="text-xl font-semibold tracking-tight">
                      {dictionary.studio.workspaceTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {dictionary.studio.workspaceDescription}
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" className="w-fit">
                  <Link href="/studio/moments">
                    {dictionary.studio.openMoments}
                  </Link>
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
  dictionary,
}: {
  isSignedIn: boolean;
  ownerGitHubUsername: string;
  signedInEmail: string | null;
  dictionary: Awaited<ReturnType<typeof getServerI18n>>["dictionary"];
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-10rem)] w-full max-w-3xl items-center">
      <BlurFade delay={BLUR_FADE_DELAY}>
        <Card className="mx-auto w-full overflow-hidden border bg-card/85">
          <CardHeader className="border-b p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{dictionary.studio.ownerOnly}</Badge>
              <Badge variant="outline">
                {dictionary.studio.githubRequired}
              </Badge>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <div className="grid size-12 place-items-center rounded-2xl border bg-background text-muted-foreground">
                <LockKeyholeIcon className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl tracking-tight sm:text-3xl">
                  {dictionary.studio.privateTitle}
                </CardTitle>
                <CardDescription className="mt-3 max-w-2xl text-sm leading-6">
                  {dictionary.studio.privateDescriptionBefore}{" "}
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
                {dictionary.studio.signedInUnauthorizedBefore}
                {signedInEmail
                  ? ` ${dictionary.studio.signedInAs} ${signedInEmail}`
                  : ""}
                ,{" "}
                {dictionary.studio.signedInUnauthorizedAfter}
              </div>
            ) : (
              <div className="rounded-2xl border bg-background/60 p-4 text-sm leading-6 text-muted-foreground">
                {dictionary.studio.signInHint}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 sm:w-fit">
                <a href={STUDIO_SIGN_IN_PATH}>
                  <Icons.github
                    className="size-4 shrink-0"
                    data-icon="inline-start"
                  />
                  {dictionary.studio.loginGitHub}
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
                    {dictionary.studio.signOutCurrent}
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
                    {dictionary.studio.viewOwner}
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
