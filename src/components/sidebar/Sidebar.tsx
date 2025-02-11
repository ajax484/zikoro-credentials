import React from "react";
import logo from "@/public/icons/logo.svg";
import Image from "next/image";
import Link from "next/link";
import Home from "@/public/icons/lets-icons_home-duotone.svg";
import Design from "@/public/icons/ph_certificate-duotone.svg";
import Analytics from "@/public/icons/ic_twotone-analytics.svg";
import Workspace from "@/public/icons/ic_twotone-admin-panel-settings.svg";
import Gift from "@/public/icons/ph_gift-duotone.svg";
import Support from "@/public/icons/ic_twotone-contact-support.svg";
import Star from "@/public/icons/ph_star-duotone.svg";
import Assign from "@/public/icons/clarity_certificate-solid-alerted (1).svg";
import EmailTemplate from "@/public/icons/iconamoon_email-duotone.svg";
import profile from "@/public/profile_1.png";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import useUserStore from "@/store/globalUserStore";
import { LogOutIcon } from "lucide-react";

type Navlinks = {
  name: string;
  href: string;
  Icon: string;
  disabled?: boolean;
};

const navlinks: Navlinks[] = [
  {
    name: "Home",
    href: "/home",
    Icon: Home,
  },
  {
    name: "Designs",
    href: "/designs",
    Icon: Design,
  },
  {
    name: "Assign",
    href: "/assign",
    Icon: Assign,
  },
  {
    name: "Analytics",
    href: "/analytics",
    Icon: Analytics,
  },
  {
    name: "Email Template",
    href: "/email/templates",
    Icon: EmailTemplate,
  },
  {
    name: "Workspace",
    href: "/workspace",
    Icon: Workspace,
  },
];

const navlinks2: Navlinks[] = [
  {
    name: "Refer & Earn",
    href: "/refer",
    Icon: Gift,
  },
  {
    name: "Support",
    href: "/support",
    Icon: Support,
    disabled: true,
  },
  {
    name: "Feedback",
    href: "/feedback",
    Icon: Star,
  },
];

const Sidebar = () => {
  const { user, setUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();

  const close = () => {
    router.push("/");
  };

  return (
    <div className="px-4 py-6 flex flex-col justify-between h-full w-[100px] group-hover:w-[200px] transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-x-2 p-3">
        <Image
          src={logo}
          width={40}
          height={40}
          alt="logo"
          className="cursor-pointer"
        />
        <div className="group-hover:flex-col group-hover:justify-center group-hover:flex hidden">
          <span className="text-2xl font-black leading-6">Zikoro</span>
          <span className="text-sm font-semibold">Credentials</span>
        </div>
      </div>

      <nav className="my-6">
        <ul className="flex flex-col gap-y-2">
          {navlinks.map(({ name, href, Icon, disabled }) => (
            <li key={name} className="w-full">
              <Link
                aria-disabled={disabled}
                onClick={close}
                prefetch={false}
                href={disabled ? {} : href}
                target={href === "/live-events" ? "_blank" : ""}
                className={cn(
                  "text-gray-800 p-3 flex items-center justify-start font-medium rounded-lg gap-x-2 group-hover:w-full w-fit",
                  href === pathname && " bg-basePrimary/10 text-[#1F1F1F]"
                )}
              >
                {Icon && (
                  <Image
                    src={Icon}
                    width={20}
                    height={20}
                    alt={name}
                    className={cn(disabled && "grayscale")}
                  />
                )}
                <span className="group-hover:block hidden text-sm delay-300 transition-all">
                  {name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <nav className="border-y py-4">
        <ul className="flex flex-col gap-y-4">
          {navlinks2.map(({ name, href, Icon, disabled }) => (
            <li key={name} className="w-full">
              <Link
                onClick={close}
                prefetch={false}
                href={disabled ? {} : href}
                target={href === "/live-events" ? "_blank" : ""}
                className={cn(
                  "p-3 flex items-center justify-start font-medium rounded-lg gap-x-2 group-hover:w-full w-fit",
                  href === pathname && " bg-basePrimary/10 text-[#1F1F1F]"
                )}
              >
                {Icon && (
                  <Image
                    src={Icon}
                    width={20}
                    height={20}
                    alt={name}
                    className={cn(disabled && "grayscale")}
                  />
                )}
                <span className="group-hover:block hidden text-sm delay-300 transition-all">
                  {name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2 p-3">
        <Image
          src={user?.profilePicture ? user?.profilePicture : profile}
          alt={"user avatar"}
          width={30}
          height={30}
          className="rounded-full"
        />
        <p className="font-medium group-hover:block hidden capitalize text-mobile sm:text-sm bg-gray-50 delay-300 transition-all">
          {user?.firstName ?? "User"}
        </p>
      </div>

      <button
        onClick={() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("user");
            setTimeout(() => {
              window.open("/", "_self");
            }, 2000);
          }
        }}
        className="flex items-center h-fit gap-x-2 p-3"
      >
        <LogOutIcon />
        <span className="text-[#EC2D30] group-hover:block hidden font-medium text-mobile sm:text-sm">
          Log Out
        </span>
      </button>
    </div>
  );
};

export default Sidebar;
