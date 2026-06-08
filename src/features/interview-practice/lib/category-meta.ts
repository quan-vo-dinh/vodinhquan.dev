export type InterviewCategoryGroup =
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "Data"
  | "DevOps"
  | "Computer Science"
  | "Career"
  | "Other";

export type InterviewIconKey =
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "state"
  | "nodejs"
  | "nestjs"
  | "python"
  | "fastapi"
  | "django"
  | "go"
  | "java"
  | "php"
  | "laravel"
  | "csharp"
  | "ruby"
  | "rails"
  | "postgresql"
  | "mongodb"
  | "redis"
  | "docker"
  | "aws"
  | "android"
  | "flutter"
  | "react-native"
  | "security"
  | "testing"
  | "git"
  | "system"
  | "career"
  | "dart"
  | "kotlin"
  | "cpp"
  | "springboot"
  | "dotnet"
  | "kafka"
  | "rabbitmq"
  | "default";

export type InterviewCategoryMeta = {
  group: InterviewCategoryGroup;
  iconKey: InterviewIconKey;
  isNew?: boolean;
};

export const INTERVIEW_CATEGORY_META: Record<string, InterviewCategoryMeta> = {
  HTML: { group: "Frontend", iconKey: "html" },
  CSS: { group: "Frontend", iconKey: "css" },
  JavaScript: { group: "Frontend", iconKey: "javascript" },
  TypeScript: { group: "Frontend", iconKey: "typescript" },
  React: { group: "Frontend", iconKey: "react" },
  "Next.js": { group: "Frontend", iconKey: "nextjs" },
  "Vue.js": { group: "Frontend", iconKey: "vue" },
  Angular: { group: "Frontend", iconKey: "angular", isNew: true },
  "State Management": { group: "Frontend", iconKey: "state" },
  "Node.js": { group: "Backend", iconKey: "nodejs" },
  NestJS: { group: "Backend", iconKey: "nestjs" },
  Python: { group: "Backend", iconKey: "python" },
  FastAPI: { group: "Backend", iconKey: "fastapi", isNew: true },
  Django: { group: "Backend", iconKey: "django", isNew: true },
  Golang: { group: "Backend", iconKey: "go" },
  Java: { group: "Backend", iconKey: "java" },
  PHP: { group: "Backend", iconKey: "php" },
  Laravel: { group: "Backend", iconKey: "laravel" },
  "C#": { group: "Backend", iconKey: "csharp" },
  Ruby: { group: "Backend", iconKey: "ruby", isNew: true },
  Rails: { group: "Backend", iconKey: "rails", isNew: true },
  "Spring Boot": { group: "Backend", iconKey: "springboot", isNew: true },
  "ASP.NET": { group: "Backend", iconKey: "dotnet", isNew: true },
  "Entity Framework": { group: "Backend", iconKey: "dotnet", isNew: true },
  "C++": { group: "Backend", iconKey: "cpp", isNew: true },
  Kotlin: { group: "Mobile", iconKey: "kotlin", isNew: true },
  Dart: { group: "Mobile", iconKey: "dart", isNew: true },
  Kafka: { group: "Backend", iconKey: "kafka", isNew: true },
  RabbitMQ: { group: "Backend", iconKey: "rabbitmq", isNew: true },
  PostgreSQL: { group: "Data", iconKey: "postgresql" },
  MongoDB: { group: "Data", iconKey: "mongodb" },
  Redis: { group: "Data", iconKey: "redis" },
  Database: { group: "Data", iconKey: "postgresql" },
  "Docker & Kubernetes": { group: "DevOps", iconKey: "docker" },
  "AWS & Cloud": { group: "DevOps", iconKey: "aws" },
  "CI/CD": { group: "DevOps", iconKey: "git" },
  Android: { group: "Mobile", iconKey: "android" },
  Flutter: { group: "Mobile", iconKey: "flutter" },
  "Flutter State": { group: "Mobile", iconKey: "flutter" },
  "Flutter Widgets": { group: "Mobile", iconKey: "flutter" },
  "React Native": { group: "Mobile", iconKey: "react-native" },
  "Jetpack Compose": { group: "Mobile", iconKey: "android", isNew: true },
  "Operating System": { group: "Computer Science", iconKey: "system" },
  Network: { group: "Computer Science", iconKey: "system" },
  DSA: { group: "Computer Science", iconKey: "system" },
  "System Design": { group: "Computer Science", iconKey: "system" },
  JVM: { group: "Backend", iconKey: "java" },
  "Java Collections": { group: "Backend", iconKey: "java" },
  Security: { group: "Computer Science", iconKey: "security" },
  Testing: { group: "Other", iconKey: "testing" },
  Git: { group: "Other", iconKey: "git" },
  "Career & Non-Tech": { group: "Career", iconKey: "career" },
  "AI Engineering": { group: "Other", iconKey: "default" },
  "Build Tools": { group: "Other", iconKey: "default" },
  "Code Quality": { group: "Other", iconKey: "default" },
  "Coding Interview": { group: "Career", iconKey: "career" },
  Debugging: { group: "Other", iconKey: "default" },
  "Design Patterns": { group: "Computer Science", iconKey: "system" },
  Performance: { group: "Other", iconKey: "default" },
  "Problem Solving": { group: "Computer Science", iconKey: "system" },
  SEO: { group: "Other", iconKey: "default" },
  "Trade-offs": { group: "Other", iconKey: "default" },
};

export const INTERVIEW_CATEGORY_GROUP_ORDER: InterviewCategoryGroup[] = [
  "Frontend",
  "Backend",
  "Mobile",
  "Data",
  "DevOps",
  "Computer Science",
  "Career",
  "Other",
];

export function getInterviewCategoryMeta(
  category: string
): InterviewCategoryMeta {
  return (
    INTERVIEW_CATEGORY_META[category] ?? {
      group: "Other",
      iconKey: "default",
    }
  );
}
