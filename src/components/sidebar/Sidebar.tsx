import React from "react";
import logo from "@/public/icons/logo.svg";
import Image from "next/image";
import Link from "next/link";
import Home from "@/public/icons/HouseLine.svg";
import Design from "@/public/icons/Certificate.svg";
import Analytics from "@/public/icons/ChartBar.svg";
import Workspace from "@/public/icons/BuildingOffice.svg";
import Gift from "@/public/icons/ph_gift-duotone.svg";
import Support from "@/public/icons/ic_twotone-contact-support.svg";
import Star from "@/public/icons/ph_star-duotone.svg";
import Assign from "@/public/icons/PaperPlaneTilt.svg";
import EmailTemplate from "@/public/icons/EnvelopeOpen.svg";
import profile from "@/public/profile_1.png";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import useUserStore from "@/store/globalUserStore";
import { LogOutIcon } from "lucide-react";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { openWhatsApp } from "@/utils/helpers";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NavModalIcon } from "@/constants";
import Integrations from "@/public/icons/PlugsConnected.svg";
import AppIcon from "@/public/icons/SquaresFour.svg";
import { motion } from "framer-motion";
import { useLogOut } from "@/hooks";

export function SupportMailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
    >
      <g fill="none">
        <path
          fill="#7109f0"
          d="m3 5l7.586 7.586a2 2 0 0 0 2.828 0L21 5v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
          opacity="0.16"
        />
        <path
          fill="#7109f0"
          d="M3 5V4a1 1 0 0 0-1 1zm18 0h1a1 1 0 0 0-1-1zM3 6h18V4H3zm17-1v12h2V5zm-1 13H5v2h14zM4 17V5H2v12zm1 1a1 1 0 0 1-1-1H2a3 3 0 0 0 3 3zm15-1a1 1 0 0 1-1 1v2a3 3 0 0 0 3-3z"
        />
        <path
          stroke="#7109f0"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m3 5l9 9l9-9"
        />
      </g>
    </svg>
  );
}

export function SupportWhatsappIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
    >
      <path
        fill="#7109f0"
        d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"
      />
    </svg>
  );
}

type Navlinks = {
  name: string;
  href: string;
  Icon: string;
  disabled?: boolean;
  restricted?: string[];
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
    restricted: ["assign"],
  },
  {
    name: "Assign",
    href: "/assign",
    Icon: Assign,
    restricted: ["create"],
  },
  {
    name: "Analytics",
    href: "/analytics",
    Icon: Analytics,
  },
  {
    name: "Email Templates",
    href: "/email/templates",
    Icon: EmailTemplate,
    restricted: ["create"],
  },
  {
    name: "Integrations",
    href: "/integrations",
    Icon: Integrations,
    restricted: ["create", "assign"],
  },
  {
    name: "Workspace",
    href: "/workspace",
    Icon: Workspace,
    restricted: ["create", "assign"],
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
  const { organization, setOrganization } = useOrganizationStore();
  const pathname = usePathname();
  const router = useRouter();
  const { logOut } = useLogOut();

  const close = () => {
    router.push("/");
  };

  console.log(pathname);

  const sidebarVariants = {
    initial: { width: 76 },
    hover: {
      width: 200,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const navItemVariants = {
    initial: { gap: 0, width: 44 },
    hover: { gap: "8px", width: 164 },
  };

  const childrenVariants = {
    initial: { opacity: 0, width: 0 },
    hover: { opacity: 1, width: "100%" },
  };

  const supportVariants = {
    initial: { opacity: 0, width: 0 },
    hover: { opacity: [0, 0, 0, 1], width: "100%" },
  };

  return (
    <motion.div
      initial="initial"
      animate="initial"
      whileHover="hover"
      className="contents"
    >
      <motion.div
        className="py-4 px-[18px] flex flex-col h-full items-center w-fit"
        // variants={sidebarVariants}
        id="sidebar"
      >
        <motion.div
          className="flex items-center w-fit mb-4"
          variants={navItemVariants}
        >
          <Image
            src={logo}
            width={35}
            height={35}
            alt="logo"
            className="cursor-pointer"
          />
          <motion.div
            variants={childrenVariants}
            className="flex flex-col justify-center overflow-hidden truncate"
          >
            <span className="text-[22px] font-bold leading-6 truncate">
              Zikoro
            </span>
            <span className="text-[10px] font-semibold truncate">
              Credentials
            </span>
          </motion.div>
        </motion.div>

        <nav className="my-4">
          <motion.ul className="flex flex-col gap-y-2.5">
            {navlinks
              .filter(
                (navlink) =>
                  !navlink.restricted?.includes(
                    organization?.role?.[0]?.userRole!
                  )
              )
              .map(({ name, href, Icon, disabled }) => (
                <motion.li
                  key={name}
                  className="w-full"
                  variants={navItemVariants}
                >
                  <Link
                    id={name + "-link"}
                    aria-disabled={disabled}
                    onClick={close}
                    prefetch={false}
                    href={disabled ? {} : href}
                    target={href === "/live-events" ? "_blank" : ""}
                    className={cn(
                      "text-gray-800 py-2.5 px-2 flex items-center gap-2 justify-start font-medium rounded-lg w-full",
                      pathname.includes(href)
                        ? "bg-basePrimary/10 text-zikoroGrey"
                        : "hover:bg-basePrimary/5 hover:text-zikoroGrey"
                    )}
                  >
                    {Icon && (
                      <Image
                        src={Icon}
                        width={24}
                        height={24}
                        alt={name}
                        className={cn(disabled && "grayscale")}
                      />
                    )}
                    <motion.span
                      variants={childrenVariants}
                      className="truncate text-sm"
                    >
                      {name}
                    </motion.span>
                  </Link>
                </motion.li>
              ))}
          </motion.ul>
        </nav>

        <nav className="border-y py-4 space-y-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                type="button"
                className={cn(
                  "text-gray-800 py-2.5 px-2 flex items-center justify-start font-medium rounded-lg hover:bg-basePrimary/5 hover:text-[#1F1F1F]"
                )}
                variants={navItemVariants}
              >
                <Image src={AppIcon} width={20} height={20} alt={"Apps"} />
                <motion.span
                  variants={childrenVariants}
                  className="truncate text-sm"
                >
                  Apps
                </motion.span>
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-fit absolute bg-white lg:flex flex-col rounded-[10px] p-0">
              {/* 1st div */}
              <div
                role="button"
                onClick={() => window.open("https://www.zikoro.com", "_blank")}
                className="w-full flex items-center gap-x-4 hover:bg-basePrimary/10 p-2.5"
              >
                {/* left */}
                <div>
                  <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                    Zikoro Events
                  </p>
                  <p className="text-[12px] font-medium text-[#31353B] w-[282px]">
                    Create event tickets, check-in attendees, send RSVPs and
                    more.{" "}
                  </p>
                </div>

                {/* right */}
                <div className="cursor-pointer ">
                  <NavModalIcon />
                </div>
              </div>

              {/* 2nd app */}
              <div
                role="button"
                onClick={() =>
                  window.open("https://engagements.zikoro.com/", "_blank")
                }
                className="w-full flex items-center gap-x-4 hover:bg-basePrimary/10 p-2.5"
              >
                {/* left */}
                <div>
                  <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                    Zikoro Engagements
                  </p>
                  <p className="text-[12px] font-medium text-[#31353B] w-[282px]">
                    Drive interaction with engaging polls, quizzes,and live Q&A{" "}
                  </p>
                </div>

                {/* right */}
                <div className="cursor-pointer ">
                  <NavModalIcon />
                </div>
              </div>

              {/* 3rd app */}
              <div
                role="button"
                onClick={() =>
                  window.open("https://bookings.zikoro.com/", "_blank")
                }
                className="w-full flex items-center gap-x-4 hover:bg-basePrimary/10 p-2.5"
              >
                {/* left */}
                <div>
                  <p className="bg-gradient-to-tr from-custom-gradient-start to-custom-gradient-end gradient-text font-semibold">
                    Zikoro Bookings
                  </p>
                  <p className="text-[12px] font-medium text-[#31353B]  w-[282px]">
                    Simplify appointment booking and scheduling for seamless
                    coordination.
                  </p>
                </div>

                {/* right */}
                <div className="cursor-pointer ">
                  <NavModalIcon />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <ul className="flex flex-col gap-y-2.5">
            {navlinks2.map(({ name, href, Icon, disabled }) => (
              <li key={name} className="w-full">
                <Link
                  id={name + "-link"}
                  aria-disabled={disabled}
                  onClick={close}
                  prefetch={false}
                  href={disabled ? {} : href}
                  target={href === "/live-events" ? "_blank" : ""}
                >
                  <motion.div
                    className={cn(
                      "text-gray-800 py-2.5 px-2 flex items-center justify-start font-medium rounded-lg",
                      pathname.includes(href)
                        ? "bg-basePrimary/10 text-[#1F1F1F]"
                        : "hover:bg-basePrimary/5 hover:text-[#1F1F1F]"
                    )}
                    variants={navItemVariants}
                  >
                    {Icon && (
                      <Image
                        src={Icon}
                        width={24}
                        height={24}
                        alt={name}
                        className={cn(disabled && "grayscale")}
                      />
                    )}
                    <motion.span
                      variants={childrenVariants}
                      className="text-sm truncate"
                    >
                      {name}
                    </motion.span>
                    {name === "Support" && (
                      <motion.div
                        variants={supportVariants}
                        className="overflow-hidden flex items-center gap-x-1"
                      >
                        <button
                          onClick={() =>
                            openWhatsApp(
                              "+2347041497076",
                              `Hello there, my name is ${user?.firstName} and I am having some issues with my account. Can you help me?`
                            )
                          }
                          aria-label="whatsapp"
                        >
                          <SupportWhatsappIcon />
                        </button>
                        <button
                          onClick={() => window.open("mailto:admin@zikoro.com")}
                          aria-label="mail"
                        >
                          <SupportMailIcon />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* <motion.button
          type="button"
          className="flex items-center py-2.5 px-2"
          variants={navItemVariants}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
          >
            <path
              fill="#000"
              d="M20.94 22H3.06a1 1 0 0 1-.994-1.108a9.995 9.995 0 0 1 19.868 0A1 1 0 0 1 20.94 22"
              opacity="0.5"
            />
            <path
              fill="#000"
              d="m12.708 18.307l4.706-4.715a10 10 0 0 0-10.833.003l4.712 4.712A1 1 0 0 0 12 18.6a1 1 0 0 0 .708-.293"
              opacity="0.25"
            />
            <path
              fill="#000"
              d="M11.995 14a6 6 0 1 1 6-6a6.007 6.007 0 0 1-6 6"
              opacity="0.25"
            />
            <path fill="#000" d="M6.09 9a5.993 5.993 0 0 0 11.82 0Z" />
          </svg>
          <motion.span variants={childrenVariants} className="text-sm truncate">
            {user?.firstName}
          </motion.span>
        </motion.button> */}

        <motion.button
          onClick={async () => {
            await logOut();
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
          variants={navItemVariants}
          className="flex items-center h-fit py-2.5 px-2"
        >
          <LogOutIcon />
          <motion.span
            variants={childrenVariants}
            className="text-[#EC2D30] truncate"
          >
            Log Out
          </motion.span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
