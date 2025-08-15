import { Input } from "@/components/ui/input";
import React from "react";

const Credentials = () => {
  const Credential = () => {
    return (
      <div className="rounded-md border bg-white">
        <div className="p-1 border-b">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Stephen Alade</h2>
            <div className="rounded-xl text-white bg-gray-700 px-2 py-1 text-xs">
              1 Points
            </div>
          </div>
          <div className="space-y-1 mb-1">
            <h3 className="font-semibold text-zikoroBlack text-xs">SKILLS</h3>
            <div className="flex gap-2 flex-wrap">
              <div className="rounded-xl text-zikoroBlack px-2 py-1 text-xs border">
                Label
              </div>
              <div className="rounded-xl text-zikoroBlack px-2 py-1 text-xs border">
                Label
              </div>
              <div className="rounded-xl text-zikoroBlack px-2 py-1 text-xs border">
                Label
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center gap-1 p-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Certified on:</span>
            <span>12th May, 2024</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-zikoroGray">Expires on:</span>
            <span>12th May, 2024</span>
          </div>
        </div>
      </div>
    );
  };
  return (
    <section>
      <div className="w-1/2">
        <Input
          placeholder="Search credential"
          className="border-none !border-b"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Credential />
        <Credential />
      </div>
    </section>
  );
};

export default Credentials;
