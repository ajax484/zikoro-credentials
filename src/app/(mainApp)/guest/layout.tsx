import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="bg-[#FAFBFF] min-h-screen relative w-full">
      <section className="py-16 max-w-[1128px] mx-auto">
        {children}
      </section>
    </main>
  );
};

export default layout;
