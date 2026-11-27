import { notFound } from "next/navigation";
import { DeviceModelView, dModelMeta } from "@/components/DevicePages";
import { CITIES, getCity } from "@/lib/data";
import { DMODELS, getDModel } from "@/lib/devices";

export const dynamicParams = false;
export const generateStaticParams = () =>
  DMODELS.filter((m) => m.kind === "ipad").flatMap((m) => CITIES.map((c) => ({ model: m.slug, city: c.slug })));

type P = { params: Promise<{ model: string; city: string }> };
const find = (slug: string) => {
  const m = getDModel(slug);
  return m?.kind === "ipad" ? m : undefined;
};

export async function generateMetadata({ params }: P) {
  const p = await params;
  const model = find(p.model);
  const city = getCity(p.city);
  return model && city ? dModelMeta(model, city) : {};
}

export default async function Page({ params }: P) {
  const p = await params;
  const model = find(p.model);
  const city = getCity(p.city);
  if (!model || !city) notFound();
  return <DeviceModelView model={model} city={city} />;
}
