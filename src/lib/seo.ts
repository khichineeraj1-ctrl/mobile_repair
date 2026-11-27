import { SITE } from "./data";

// Search results cut titles at about 60 characters and descriptions at about
// 155. Give the options from most to least detailed; the first that fits wins.
export const fit = (options: string[], max: number) => options.find((o) => o.length <= max) ?? options[options.length - 1];
export const TITLE_MAX = 60;
export const DESC_MAX = 155;


// Breadcrumb structured data. Pass [name, path] pairs after Home.
export const breadcrumbs = (trail: [string, string][]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [["Home", "/"] as [string, string], ...trail].map(([name, path], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item: SITE.url + path,
  })),
});
