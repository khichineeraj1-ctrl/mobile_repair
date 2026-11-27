import { notFound } from "next/navigation";
import ModelView, { modelMeta } from "@/components/ModelView";
import { CITIES, MODELS, getCity, getModel } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () =>
  MODELS.flatMap((m) => CITIES.map((c) => ({ brand: "apple", model: m.slug, city: c.slug })));

type P = { params: Promise<{ brand: string; model: string; city: string }> };

export async function generateMetadata({ params }: P) {
  const p = await params;
  const model = getModel(p.model);
  const city = getCity(p.city);
  return model && city ? modelMeta(model, city) : {};
}

export default async function Page({ params }: P) {
  const p = await params;
  const model = getModel(p.model);
  const city = getCity(p.city);
  if (!model || !city) notFound();
  return <ModelView model={model} city={city} />;
}
