import { notFound } from "next/navigation";
import { DeviceModelView, dModelMeta } from "@/components/DevicePages";
import { DMODELS, getDModel } from "@/lib/devices";

export const dynamicParams = false;
export const generateStaticParams = () => DMODELS.filter((m) => m.kind === "ipad").map((m) => ({ model: m.slug }));

type P = { params: Promise<{ model: string }> };
const find = (slug: string) => {
  const m = getDModel(slug);
  return m?.kind === "ipad" ? m : undefined;
};

export async function generateMetadata({ params }: P) {
  const model = find((await params).model);
  return model ? dModelMeta(model) : {};
}

export default async function Page({ params }: P) {
  const model = find((await params).model);
  if (!model) notFound();
  return <DeviceModelView model={model} />;
}
