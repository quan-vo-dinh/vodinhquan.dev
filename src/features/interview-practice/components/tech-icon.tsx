import type { ComponentType, SVGProps } from "react";
import {
  TbAward,
  TbBinaryTree,
  TbBook,
  TbBriefcase,
  TbBug,
  TbClipboardCheck,
  TbCloud,
  TbCode,
  TbCpu,
  TbDatabase,
  TbDeviceDesktop,
  TbDeviceMobile,
  TbFileCode,
  TbGauge,
  TbGitBranch,
  TbHierarchy,
  TbBulb,
  TbNetwork,
  TbPackage,
  TbPuzzle,
  TbRobot,
  TbScale,
  TbShieldCheck,
  TbShieldLock,
  TbStack2,
  TbTools,
  TbTrendingUp,
  TbUserCode,
} from "react-icons/tb";

import { Angular } from "@/components/ui/svgs/angular";
import { Csharp } from "@/components/ui/svgs/csharp";
import { CssOld } from "@/components/ui/svgs/cssOld";
import { Django } from "@/components/ui/svgs/django";
import { Docker } from "@/components/ui/svgs/docker";
import { Fastapi } from "@/components/ui/svgs/fastapi";
import { Golang } from "@/components/ui/svgs/golang";
import { Html5 } from "@/components/ui/svgs/html5";
import { Java } from "@/components/ui/svgs/java";
import { Javascript } from "@/components/ui/svgs/javascript";
import { MongodbIconLight } from "@/components/ui/svgs/mongodbIconLight";
import { Nestjs } from "@/components/ui/svgs/nestjs";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Python } from "@/components/ui/svgs/python";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { Redis } from "@/components/ui/svgs/redis";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Vue } from "@/components/ui/svgs/vue";
import { Redux } from "@/components/ui/svgs/redux";
import { PHP } from "@/components/ui/svgs/php";
import { Laravel } from "@/components/ui/svgs/laravel";
import { Ruby } from "@/components/ui/svgs/ruby";
import { Rails } from "@/components/ui/svgs/rails";
import { AWS } from "@/components/ui/svgs/aws";
import { Android } from "@/components/ui/svgs/android";
import { Flutter } from "@/components/ui/svgs/flutter";
import { Git } from "@/components/ui/svgs/git";
import { Dart } from "@/components/ui/svgs/dart";
import { Kotlin } from "@/components/ui/svgs/kotlin";
import { Cpp } from "@/components/ui/svgs/cpp";
import { SpringBoot } from "@/components/ui/svgs/springboot";
import { Dotnet } from "@/components/ui/svgs/dotnet";
import { Kafka } from "@/components/ui/svgs/kafka";
import { Rabbitmq } from "@/components/ui/svgs/rabbitmq";
import { cn } from "@/lib/utils";

import type { InterviewIconKey } from "../lib/category-meta";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconRegistry: Partial<Record<InterviewIconKey, IconComponent>> = {
  html: Html5,
  css: CssOld,
  javascript: Javascript,
  typescript: Typescript,
  react: ReactLight,
  nextjs: NextjsIconDark,
  vue: Vue,
  angular: Angular,
  state: Redux,
  nodejs: Nodejs,
  nestjs: Nestjs,
  python: Python,
  fastapi: Fastapi,
  django: Django,
  go: Golang,
  java: Java,
  csharp: Csharp,
  postgresql: Postgresql,
  mongodb: MongodbIconLight,
  redis: Redis,
  docker: Docker,
  php: PHP,
  laravel: Laravel,
  ruby: Ruby,
  rails: Rails,
  aws: AWS,
  android: Android,
  flutter: Flutter,
  "react-native": ReactLight,
  git: Git,
  dart: Dart,
  kotlin: Kotlin,
  cpp: Cpp,
  springboot: SpringBoot,
  dotnet: Dotnet,
  kafka: Kafka,
  rabbitmq: Rabbitmq,
};

const fallbackRegistry: Record<InterviewIconKey, IconComponent> = {
  html: TbFileCode,
  css: TbFileCode,
  javascript: TbCode,
  typescript: TbCode,
  react: TbCode,
  nextjs: TbCode,
  vue: TbCode,
  angular: TbCode,
  state: TbStack2,
  nodejs: TbCode,
  nestjs: TbCode,
  python: TbCode,
  fastapi: TbCode,
  django: TbCode,
  go: TbCode,
  java: TbCode,
  php: TbCode,
  laravel: TbCode,
  csharp: TbCode,
  ruby: TbCode,
  rails: TbCode,
  postgresql: TbDatabase,
  mongodb: TbDatabase,
  redis: TbDatabase,
  docker: TbPackage,
  aws: TbCloud,
  android: TbDeviceMobile,
  flutter: TbDeviceMobile,
  "react-native": TbDeviceMobile,
  security: TbShieldLock,
  testing: TbClipboardCheck,
  git: TbGitBranch,
  system: TbDeviceDesktop,
  career: TbBriefcase,
  dart: TbDeviceMobile,
  kotlin: TbDeviceMobile,
  cpp: TbCode,
  springboot: TbCode,
  dotnet: TbCode,
  kafka: TbDatabase,
  rabbitmq: TbDatabase,
  default: TbScale,
  database: TbDatabase,
  dsa: TbBinaryTree,
  os: TbCpu,
  network: TbNetwork,
  "system-design": TbHierarchy,
  "design-patterns": TbPuzzle,
  "problem-solving": TbBulb,
  "coding-interview": TbUserCode,
  ai: TbRobot,
  "build-tools": TbTools,
  "code-quality": TbAward,
  debugging: TbBug,
  seo: TbTrendingUp,
  performance: TbGauge,
};

const iconColors: Partial<Record<InterviewIconKey, string>> = {
  dsa: "text-blue-500 dark:text-blue-400",
  database: "text-blue-600 dark:text-blue-500",
  os: "text-cyan-500 dark:text-cyan-400",
  network: "text-indigo-500 dark:text-indigo-400",
  "system-design": "text-violet-500 dark:text-violet-400",
  "design-patterns": "text-emerald-500 dark:text-emerald-400",
  "problem-solving": "text-amber-500 dark:text-amber-400",
  security: "text-red-500 dark:text-red-400",
  career: "text-rose-500 dark:text-rose-400",
  "coding-interview": "text-purple-500 dark:text-purple-400",
  ai: "text-fuchsia-500 dark:text-fuchsia-400",
  "build-tools": "text-zinc-500 dark:text-zinc-400",
  "code-quality": "text-teal-500 dark:text-teal-400",
  debugging: "text-orange-500 dark:text-orange-400",
  seo: "text-lime-500 dark:text-lime-400",
  performance: "text-yellow-500 dark:text-yellow-400",
  testing: "text-pink-500 dark:text-pink-400",
  git: "text-orange-600 dark:text-orange-500",
  default: "text-sky-500 dark:text-sky-400",
};

type TechIconProps = {
  iconKey: InterviewIconKey;
  className?: string;
  iconClassName?: string;
};

export function TechIcon({ iconKey, className, iconClassName }: TechIconProps) {
  const Icon = iconRegistry[iconKey] ?? fallbackRegistry[iconKey] ?? TbBook;
  const colorClass = iconColors[iconKey];

  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-transparent", className || "size-5")}>
      <Icon className={cn(colorClass, iconClassName || "size-4")} aria-hidden />
    </span>
  );
}
