import { notFound } from "next/navigation";
import ModelView, { modelMeta } from "@/components/ModelView";
import { MODELS, getModel } from "@/lib/data";

export const dynamicParams = false;
export const generateStaticParams = () => MODELS.map((m) => ({ brand: "apple", model: m.slug }));

type P = { params: Promise<{ brand: string; model: string }> };

export async function generateMetadata({ params }: P) {
  const model = getModel((await params).model);
  return model ? modelMeta(model) : {};
}

export default async function Page({ params }: P) {
  const model = getModel((await params).model);
  if (!model) notFound();
  return <ModelView model={model} />;
}
