import { List, X } from "@phosphor-icons/react";
import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  NAVLINKS,
  NAVLINKS2,
  SupportMailIcon,
  SupportWhatsappIcon,
} from "../sidebar/Sidebar";
import useOrganizationStore from "@/store/globalOrganizationStore";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import logo from "@/public/icons/logo.svg";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { openWhatsApp } from "@/utils/helpers";
import useUserStore from "@/store/globalUserStore";
import AppIcon from "@/public/icons/SquaresFour.svg";
import { NavModalIcon } from "@/constants";
import { LogOutIcon } from "lucide-react";
import { useLogOut } from "@/hooks";

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const { organization } = useOrganizationStore();

  const { user } = useUserStore();

  const pathname = usePathname();

  const { logOut } = useLogOut();

  return (
    <>
      <button
        aria-label="Menu"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-4 right-2 p-2 rounded-xl bg-white border-2 border-basePrimary z-[49]"
      >
        {!isOpen ? (
          <List color="#001fcc" size={24} weight="bold" />
        ) : (
          <X color="#001fcc" size={24} weight="bold" />
        )}
      </button>

      <motion.aside
        initial="initial"
        animate="initial"
        whileHover="hover"
        className={cn(
          "fixed inset-y-0 top-0 left-0 z-[48] w-full h-screen",
          isOpen ? "block md:hidden" : "hidden"
        )}
      >
        <motion.div
          initial={{ x: "-100%" }} // hidden offscreen
          animate={{ x: isOpen ? 0 : "-100%" }} // slide in/out
          transition={{ type: "spring", stiffness: 80, damping: 15 }}
          className="pt-16 px-4 flex flex-col h-full items-center w-fit bg-white mr-auto border-r border-basePrimary"
        >
          <motion.div
            className="flex items-center w-fit mb-4"
            // variants={navItemVariants}
          >
            <Image
              src={logo}
              width={35}
              height={35}
              alt="logo"
              className="cursor-pointer"
            />
            <motion.div
              // variants={childrenVariants}
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
              {NAVLINKS.filter(
                (navlink) =>
                  !navlink.restricted?.includes(
                    organization?.role?.[0]?.userRole!
                  )
              ).map(({ name, href, Icon, disabled }) => (
                <motion.li
                  key={name}
                  className="w-full"
                  // variants={navItemVariants}
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
                      // variants={childrenVariants}
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
                  // variants={navItemVariants}
                >
                  <Image src={AppIcon} width={20} height={20} alt={"Apps"} />
                  <motion.span
                    // variants={childrenVariants}
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
                  onClick={() =>
                    window.open("https://www.zikoro.com", "_blank")
                  }
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
                      Drive interaction with engaging polls, quizzes,and live
                      Q&A{" "}
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
              {NAVLINKS2.map(({ name, href, Icon, disabled }) => (
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
                      // variants={navItemVariants}
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
                        // variants={childrenVariants}
                        className="text-sm truncate"
                      >
                        {name}
                      </motion.span>
                      {name === "Support" && (
                        <motion.div
                          // variants={supportVariants}
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
                            onClick={() =>
                              window.open("mailto:admin@zikoro.com")
                            }
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

          <motion.button
            onClick={async () => {
              await logOut();
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            // variants={navItemVariants}
            className="flex items-center h-fit py-2.5 px-2 gap-2"
          >
            <LogOutIcon />
            <motion.span
              // variants={childrenVariants}
              className="text-[#EC2D30] truncate"
            >
              Log Out
            </motion.span>
          </motion.button>
        </motion.div>
      </motion.aside>
    </>
  );
};

export default Navbar;
