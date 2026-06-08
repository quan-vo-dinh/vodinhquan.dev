import { Icons } from "@/components/icons";
import { BrainCircuitIcon, HomeIcon, NotebookIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
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
    "A Former Frontend dev, currently a handyman dev, focusing on Backend.",
  summary:
    "Final-year Information Systems student passionate about modern web development in the JavaScript and TypeScript ecosystem. Experienced in building full-stack applications with Next.js and NestJS.",
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
    { href: "/interview", icon: BrainCircuitIcon, label: "Interview" },
  ],
  contact: {
    email: "vodinhquan2707.it@gmail.com",
    tel: "033 277 0502",
    social: {
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/vodinhquan27/",
        icon: Icons.linkedin,
        navbar: true,
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
