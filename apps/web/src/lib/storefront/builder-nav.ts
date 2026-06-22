import type { LucideIcon } from "lucide-react";
import { Camera, Cpu, Laptop, Puzzle } from "lucide-react";
import { builderPcPath, builderPath, storefrontPaths } from "@/lib/url-slug/storefront-paths";

export type StorefrontBuilderNavItem = {
  id: string;
  label: string;
  description: string;
  href: string | null;
  icon: LucideIcon;
  available: boolean;
};

export const storefrontBuilderNavItems: StorefrontBuilderNavItem[] = [
  {
    id: "hub",
    label: "All Builders",
    description: "Browse every configurator",
    href: builderPath(),
    icon: Puzzle,
    available: true,
  },
  {
    id: "pc",
    label: "PC Builder",
    description: "CPU, GPU, RAM & more — live compatibility",
    href: builderPcPath(),
    icon: Cpu,
    available: true,
  },
  {
    id: "laptop",
    label: "Laptop Builder",
    description: "Custom laptop configuration",
    href: null,
    icon: Laptop,
    available: false,
  },
  {
    id: "cctv",
    label: "CCTV Builder",
    description: "Camera, NVR & storage kits",
    href: null,
    icon: Camera,
    available: false,
  },
];

export function isBuilderNavActive(pathname: string): boolean {
  return pathname === storefrontPaths.builder || pathname.startsWith(`${storefrontPaths.builder}/`);
}
