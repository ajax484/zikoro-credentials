import { Metadata } from "next";
import Home from "./_components/Home";

export const metadata: Metadata = {
  title: "Credentials - Home",
};

export default function Page({
  searchParams,
}: {
  searchParams: { workspaceAlias: string };
}) {
  return <Home workspaceAlias={searchParams.workspaceAlias} />;
}
