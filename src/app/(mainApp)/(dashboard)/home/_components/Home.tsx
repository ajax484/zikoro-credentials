"use client";
import useUserStore from "@/store/globalUserStore";
import React from "react";
import Badge from "@/public/icons/iconamoon_certificate-badge-duotone.svg";
import Certificate from "@/public/icons/ph_certificate-duotone.svg";
import Image from "next/image";
import { useGetData } from "@/hooks/services/request";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TCertificate } from "@/types/certificates";
import Email from "@/public/icons/mdi_email-sent.svg";
import Calendar from "@/public/icons/duo-icons_calendar.svg";
import { format } from "date-fns";
import Link from "next/link";

const Home = () => {
  const { user, setUser } = useUserStore();
  // const router = useRouter();

  // if (!user) return router.push("/login");

  console.log(user);

  const {
    data: certificates,
    isLoading: certificatesIsLoading,
    error,
  } = useGetData<TCertificate[]>(`/certificates?userId=${user.id}`, true, []);

  console.log(certificates);

  return (
    <section className="space-y-4">
      <div className="text-gray-700">
        <p>
          Hello, <b>{user?.firstName}</b>
        </p>
        <p className="text-sm text-gray-600">
          What will you be working on today?
        </p>
      </div>

      <div className="grid gap-4">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="rounded flex-1 flex flex-col items-center justify-center px-2 py-12 bg-white border">
              <Image
                src={Certificate}
                alt={"certificate"}
                width={30}
                height={30}
                className="rounded-full"
              />
              <p className="font-medium text-sm">Create new certificate</p>
            </div>
            <div className="rounded flex-1 flex flex-col items-center justify-center px-2 py-12 bg-white border">
              <Image
                src={Badge}
                alt={"badge certificate"}
                width={30}
                height={30}
                className="rounded-full"
              />
              <p className="font-medium text-sm">Create new event badge</p>
            </div>
          </div>

          <div className="border rounded-md bg-white">
            <h2 className="text-sm text-gray-700 font-medium text-center py-2 border-b">
              My designs
            </h2>
            <div className="p-4">
              <Tabs defaultValue="certificates" className="w-full">
                <TabsList className="flex mx-auto w-1/2 mb-6">
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 group data-[state=active]:text-white flex gap-2"
                    value="certificates"
                  >
                    <span>Certificates</span>
                    <span className="rounded-full text-xs items-center justify-center group-data-[state=active]:bg-white group-data-[state=active]:text-blue-700 px-2 py-1 bg-gray-300 text-gray-600">
                      {certificates?.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    className="w-full data-[state=active]:bg-blue-700 data-[state=active]:text-white"
                    value="badges"
                  >
                    Badges
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="certificates">
                  <div className="grid grid-cols-6 gap-4 mb-4">
                    {certificates?.slice(0, 6)?.map((certificate) => (
                      <div
                        key={certificate.id}
                        className="rounded-lg border border-gray-200 bg-white"
                      >
                        <div className="h-[150px] w-full bg-gray-200 relative">
                          {certificate?.cerificateUrl && (
                            <Image
                              src={certificate?.cerificateUrl ?? ""}
                              alt={certificate.name}
                              objectFit="cover"
                              layout="fill"
                            />
                          )}
                        </div>
                        <div className="p-2 space-y-2">
                          <p className="font-medium text-gray-700 text-sm capitalize">
                            {certificate.name}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Image
                                src={Email}
                                alt={"email"}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <p className="text-xs text-gray-600">40</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Image
                                src={Calendar}
                                alt={"calendar"}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                              <p className="text-xs text-gray-600">
                                {format(certificate.created_at, "dd/MM/yyyy")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={"/"}
                    className="bg-basePrimary gap-x-2 text-gray-50 font-medium flex items-center justify-center rounded-lg py-2 px-4 mx-auto w-fit text-sm"
                  >
                    See all
                  </Link>
                </TabsContent>
                <TabsContent value="badges">
                  Change your password here.
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
