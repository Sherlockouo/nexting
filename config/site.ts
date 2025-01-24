import {
  IconBrandTablerFilled,
  IconFolderFilled,
  IconHelp,
  IconLogout,
  IconSettingsFilled,
  IconUserFilled,
} from "@tabler/icons-react";
import React from "react";

// Define interfaces for better type definitions
interface NavMenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>; // Adjust props as needed
}

export interface SiteConfig {
  name: string;
  description: string;
  navItems: { label: string; href: string }[];
  navMenuItems: NavMenuItem[];
  links: { docs: string };
}

// Export siteConfig with correct types
export const siteConfig: SiteConfig = {
  name: "Next.js + NextUI",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Chat",
      href: "/chat",
    },
    {
      label: "talk",
      href: "/talk",
    },
    {
      label: "rss",
      href: "/rss",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
      icon: IconUserFilled,
    },
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: IconBrandTablerFilled,
    },
    {
      label: "Projects",
      href: "/projects",
      icon: IconFolderFilled,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: IconSettingsFilled,
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
      icon: IconHelp,
    },
    {
      label: "Logout",
      href: "/logout",
      icon: IconLogout,
    },
  ],
  links: {
    docs: "https://nextui.org",
  },
};

// In the consuming component, render icons as follows:
// {item.icon && <item.icon />}
