import { Icons } from "@/components/icons";
import {
  BrainCircuitIcon,
  CameraIcon,
  FolderKanbanIcon,
  HomeIcon,
  NotebookIcon,
} from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import type { Locale } from "@/i18n/locale";
import React from "react";

const createSimpleIcon = (slug: string) => {
  const IconComponent = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slug.startsWith("http") ? slug : `https://cdn.simpleicons.org/${slug}`}
      alt={slug}
      {...props}
    />
  );
  IconComponent.displayName = `SimpleIcon_${slug}`;
  return IconComponent;
};

export const DATA = {
  name: "Vo Dinh Quan",
  nickname: "bin",
  initials: "VDQ",
  url: "https://vodinhquan.dev",
  location: "Ho Chi Minh City, VN",
  locationLink: "https://www.google.com/maps/place/Ho+Chi+Minh+City,+Vietnam",
  description:
    "Full-stack Developer building scalable applications with Next.js & NestJS.",
  summary:
    "Final-year Information Systems student passionate about modern web development in the JavaScript and TypeScript ecosystem. Experienced in building full-stack applications with Next.js and NestJS. I place a high emphasis on code quality, clean architecture, and writing clean, scalable, and maintainable code.",
  avatarUrl: "/me.jpg",
  skills: [
    { name: "TypeScript", icon: Typescript },
    { name: "React.js", icon: ReactLight },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "Tailwind CSS", icon: Icons.tailwindcss },
    { name: "Docker", icon: Docker },
    { name: "Ant Design", icon: createSimpleIcon("antdesign") },
    { name: "TanStack Query", icon: createSimpleIcon("reactquery") },
    { name: "Nest.js", icon: createSimpleIcon("nestjs") },
    { name: "WebSocket", icon: createSimpleIcon("socketdotio") },
    { name: "Redis", icon: createSimpleIcon("redis") },
    { name: "Apache Kafka", icon: createSimpleIcon("apachekafka") },
    { name: "Keycloak", icon: createSimpleIcon("keycloak") },
    { name: "MongoDB", icon: createSimpleIcon("mongodb") },
    { name: "PostgreSQL", icon: Postgresql },
  ] as { name: string; icon?: any }[],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
    { href: "/blog", icon: NotebookIcon, label: "Blog" },
    { href: "/moments", icon: CameraIcon, label: "Moments" },
    { href: "/studio", icon: FolderKanbanIcon, label: "Studio" },
    { href: "/interview", icon: BrainCircuitIcon, label: "Interview" },
  ],
  contact: {
    email: "vodinhquan2707.it@gmail.com",
    tel: "033 277 0502",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/quan-vo-dinh",
        icon: Icons.github,
        navbar: false,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/vodinhquan27/",
        icon: Icons.linkedin,
        navbar: false,
      },
      Facebook: {
        name: "Facebook",
        url: "https://www.facebook.com/vdquan.27",
        icon: Icons.facebook,
        navbar: false,
      },
      Instagram: {
        name: "Instagram",
        url: "https://www.instagram.com/vdq.27/",
        icon: Icons.instagram,
        navbar: false,
      },
      X: {
        name: "X",
        url: "#",
        icon: Icons.x,
        navbar: false,
      },
      Youtube: {
        name: "Youtube",
        url: "#",
        icon: Icons.youtube,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:vodinhquan2707.it@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "WM Media",
      href: "#",
      badges: ["Freelance"],
      location: "Remote",
      title: "Freelance Full-stack",
      logoUrl: "wm.png",
      start: "Nov 2025",
      end: "Jan 2026",
      description:
        "• Contributed to a company-specific payroll module in an internal custom ERP system, focusing on salary records, allowances, deductions, and payroll periods.\n• Built and integrated basic full-stack features using React.js, Express.js, TypeScript, Prisma, and PostgreSQL.\n• Collaborated in a 4-member freelance team on payroll rules, UI/API changes, bug fixes, and payroll flow testing.",
    },
    {
      company: "GEEK Up",
      href: "https://geekup.vn",
      badges: ["Internship"],
      location: "Ho Chi Minh City, VN",
      title: "Frontend Intern",
      logoUrl: "/geekup.jpg",
      start: "Jun 2025",
      end: "Sep 2025",
      description:
        "• Engineered the Commitment Module for OGeek 2.0 across User/Admin sites in collaboration with BE and DS teams.\n• Developed responsive web applications using React.js, TypeScript, TanStack Query, Ant Design, and Tailwind CSS.\n• Wrote API specs and development guidelines to streamline frontend/backend integration.\n• Delivered features consistently in an Agile Scrum environment, including sprint planning and daily stand-ups.\n• Maintained high code quality via GitLab workflows, including Git Flow, merge requests, and issue tracking.",
    },
  ],
  education: [
    {
      school: "VNUHCM - University of Information Technology",
      href: "https://www.uit.edu.vn",
      degree: "Information Systems",
      logoUrl: "uit.png",
      start: "Sep 2022",
      end: "Sep 2026",
    },
  ],
  projects: [
    {
      title: "QRTable – Microservices-Based SaaS POS",
      href: "#",
      dates: "Jan 2026 - Jun 2026",
      active: true,
      description:
        "SaaS POS & QR Ordering platform for F&B businesses.",
      technologies: [
        "Nx Monorepo",
        "NestJS",
        "React.js",
        "Next.js",
        "PostgreSQL",
        "MongoDB",
        "Redis",
        "Kafka",
        "Socket.IO",
        "Keycloak",
        "Docker",
      ],
      links: [],
      image: "/qrtable.png",
      video: "",
    },
    {
      title: "Multi Vendor API",
      href: "#",
      dates: "2025",
      active: true,
      description:
        "Backend for a multi-vendor e-commerce system.",
      technologies: [
        "NestJS",
        "PostgreSQL",
        "Prisma",
        "Socket.io",
        "JWT",
        "Resend",
        "AWS S3",
        "Redis",
        "BullMQ",
        "SePay",
      ],
      links: [],
      image: "/multi-vendor.jpg",
      video: "",
    },
    {
      title: "Kicks Shoes",
      href: "#",
      dates: "2024",
      active: true,
      description:
        "👟 Sleek and modern e-commerce shoe store website built with React and Laravel, designed for showcasing and selling shoes.",
      technologies: ["JavaScript", "React.js", "Laravel", "MySQL"],
      links: [],
      image: "/kick.png",
      video: "",
    },
    {
      title: "Car Garage Management",
      href: "#",
      dates: "2023",
      active: true,
      description:
        "A desktop application built entirely in Java and Java Swing for managing car garage operations, customer records, and inventory.",
      technologies: ["Java", "Java Swing", "MySQL"],
      links: [],
      image: "/car-garage.png",
      video: "",
    },
  ],
  certifications: [
    {
      name: "React Basics - Front-End Developer Professional Certificate",
      issuer: "Meta / Coursera",
      href: "https://coursera.org/share/c20d639cc9c1220c6173e3714dcdd085",
      logoUrl: "/meta.png",
    },
    {
      name: "Advanced React - Front-End Developer Professional Certificate",
      issuer: "Meta / Coursera",
      href: "https://coursera.org/share/48edccd70ccd16f2a8894fa648facc6d",
      logoUrl: "/meta.png",
    },
    {
      name: "Developing Back-End Apps with Node.js and Express",
      issuer: "IBM / Coursera",
      href: "https://coursera.org/share/ff6ddc611178fd52a39c508282f20b45",
      logoUrl: "/ibm.png",
    },
  ],
  hackathons: [] as readonly {
    readonly title: string;
    readonly dates: string;
    readonly location: string;
    readonly description: string;
    readonly image?: string;
    readonly mlh?: string;
    readonly links: readonly {
      readonly title: string;
      readonly icon: React.ReactNode;
      readonly href: string;
    }[];
  }[],
} as const;

const VI_RESUME_COPY = {
  description:
    "Cựu dev Frontend, hiện tại đang là một thợ đụng - đụng đâu làm đó! 🛠️",
  education: [
    {
      degree: "Hệ thống Thông tin",
      start: "09/2022",
      end: "09/2026",
    },
  ],
  location: "TP. Hồ Chí Minh, Việt Nam",
  projects: [
    {
      dates: "01/2026 - 06/2026",
      description:
        "Nền tảng POS SaaS kiêm gọi món bằng mã QR 'xịn xò' dành cho các mô hình kinh doanh F&B.",
    },
    {
      dates: "2025",
      description:
        "Hệ thống Backend cho sàn thương mại điện tử đa nhà bán hàng siêu mượt.",
    },
    {
      dates: "2024",
      description:
        "👟 Website bán giày hiện đại làm bằng React và Laravel, thiết kế sang xịn mịn giúp trưng bày và mua sắm siêu mượt.",
    },
    {
      dates: "2023",
      description:
        "Ứng dụng máy tính viết bằng Java Swing giúp gara quản lý vận hành, thông tin khách hàng và kho phụ tùng gọn lẹ.",
    },
  ],
  summary:
    "Sinh ziên năm cuối ngành Hệ thống Thông tin có niềm đam mê mãnh liệt với code dạo và xây dựng các sản phẩm web xịn xò. Đang 'tu luyện' trong hệ sinh thái JavaScript/TypeScript và đã có kinh nghiệm thực chiến làm app full-stack từ Next.js đến NestJS. Dị ứng với code dơ, code bẩn, luôn hướng tới viết code sạch (clean code) cùng những kiến trúc hệ thống đẹp đẽ, dễ mở rộng.",
  work: [
    {
      badges: ["Freelance"],
      location: "Từ xa",
      title: "Lập trình viên Full-stack tự do",
      start: "11/2025",
      end: "01/2026",
      description:
        "• Tham gia code module tính lương riêng cho doanh nghiệp trong hệ thống ERP nội bộ, xử lý đống logic lương bổng, phụ cấp, khấu trừ và kỳ lương.\n• Xây dựng và tích hợp các tính năng full-stack bằng React.js, Express.js, TypeScript, Prisma và PostgreSQL.\n• Phối hợp cùng tổ đội freelance 4 người để thiết lập quy tắc tính lương, chỉnh sửa giao diện/API và test luồng thanh toán.",
    },
    {
      badges: ["Thực tập"],
      location: "TP. Hồ Chí Minh, Việt Nam",
      title: "Thực tập sinh Frontend",
      start: "06/2025",
      end: "09/2025",
      description:
        "• Phát triển Commitment Module cho OGeek 2.0 trên cả trang User và Admin, bắt tay cùng đội Backend và Design System.\n• Xây dựng các app responsive với React.js, TypeScript, TanStack Query, Ant Design và Tailwind CSS.\n• Viết tài liệu API và hướng dẫn phát triển để tối ưu hóa việc ghép nối Frontend/Backend.\n• Làm việc chuẩn Agile Scrum, tham gia họp hành daily stand-up và quản lý code xịn xò qua GitLab/Git Flow.",
    },
  ],
} as const;

export function getResumeData(locale: Locale) {
  if (locale === "en") {
    return DATA;
  }

  return {
    ...DATA,
    description: VI_RESUME_COPY.description,
    education: DATA.education.map((education, index) => ({
      ...education,
      ...VI_RESUME_COPY.education[index],
    })),
    location: VI_RESUME_COPY.location,
    projects: DATA.projects.map((project, index) => ({
      ...project,
      ...VI_RESUME_COPY.projects[index],
    })),
    summary: VI_RESUME_COPY.summary,
    work: DATA.work.map((work, index) => ({
      ...work,
      ...VI_RESUME_COPY.work[index],
    })),
  };
}
