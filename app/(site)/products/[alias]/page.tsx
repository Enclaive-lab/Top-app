import { getPage } from "@/api/page";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Страница",
};

export default async function PageProducts({
  params,
}: {
  params: Promise<{ alias: string }>;
}) {
  const { alias } = await params;
  const page = await getPage(alias);

  if (!page) {
    notFound();
  }

  return <div>Страница c alias {page.alias}</div>;
}
