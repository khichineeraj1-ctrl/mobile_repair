// ---------------------------------------------------------------------------
// !! SAMPLE PROFILES !!  These technicians, ratings and job counts are invented
// so the marketplace flow can be designed and tested. Replace with real,
// onboarded technicians (and real ratings) before launch, then set
// DEMO_TECHNICIANS to false to remove the "sample profiles" note in the UI.
// ---------------------------------------------------------------------------

export const DEMO_TECHNICIANS = true;

export type Technician = {
  id: string;
  name: string; // first name + initial only; full identity stays private
  city: string; // city slug from data.ts
  years: number; // total repair experience
  jobs: number; // repairs completed on the platform
  rating: number | null; // null until they have enough platform reviews
  langs: string[];
  slots: string[]; // slots they normally work
  hue: number; // avatar colour
  paused?: boolean; // set in the admin: hidden from customers, takes no bookings
  added?: boolean; // onboarded through the admin, not one of the sample profiles
};

const ALL = ["morning", "afternoon", "evening"];
const t = (id: string, name: string, city: string, years: number, jobs: number, rating: number | null, langs: string, slots = ALL): Technician => ({
  id,
  name,
  city,
  years,
  jobs,
  rating,
  langs: langs.split(", "),
  slots,
  hue: (id.charCodeAt(1) * 47 + id.charCodeAt(2) * 13) % 360,
});

export const TECHNICIANS: Technician[] = [
  t("d01", "Rohit S.", "delhi", 9, 412, 4.8, "Hindi, English"),
  t("d02", "Imran K.", "delhi", 6, 187, 4.7, "Hindi, English, Urdu", ["afternoon", "evening"]),
  t("d03", "Deepak V.", "delhi", 4, 0, null, "Hindi"),
  t("m01", "Sachin P.", "mumbai", 11, 530, 4.9, "Marathi, Hindi, English"),
  t("m02", "Faisal S.", "mumbai", 5, 143, 4.6, "Hindi, English", ["morning", "afternoon"]),
  t("m03", "Nilesh J.", "mumbai", 3, 0, null, "Marathi, Hindi"),
  t("b01", "Manjunath R.", "bengaluru", 8, 365, 4.8, "Kannada, English, Hindi"),
  t("b02", "Arun K.", "bengaluru", 6, 201, 4.7, "Tamil, Kannada, English", ["afternoon", "evening"]),
  t("b03", "Syed A.", "bengaluru", 4, 0, null, "Hindi, English, Kannada"),
  t("h01", "Venkat R.", "hyderabad", 10, 298, 4.8, "Telugu, Hindi, English"),
  t("h02", "Abdul R.", "hyderabad", 7, 164, 4.7, "Hindi, Urdu, Telugu", ["morning", "evening"]),
  t("h03", "Kiran M.", "hyderabad", 3, 0, null, "Telugu, English"),
  t("c01", "Karthik S.", "chennai", 9, 341, 4.9, "Tamil, English"),
  t("c02", "Prakash M.", "chennai", 5, 122, 4.6, "Tamil, English, Hindi", ["morning", "afternoon"]),
  t("c03", "Dinesh B.", "chennai", 4, 0, null, "Tamil"),
  t("p01", "Amol D.", "pune", 8, 276, 4.8, "Marathi, Hindi, English"),
  t("p02", "Rahul G.", "pune", 5, 131, 4.7, "Hindi, English", ["afternoon", "evening"]),
  t("p03", "Tushar K.", "pune", 3, 0, null, "Marathi, Hindi"),
  t("k01", "Subhajit D.", "kolkata", 10, 254, 4.8, "Bengali, Hindi, English"),
  t("k02", "Arif H.", "kolkata", 6, 118, 4.6, "Bengali, Hindi", ["morning", "evening"]),
  t("k03", "Sourav M.", "kolkata", 4, 0, null, "Bengali, English"),
  t("a01", "Jignesh P.", "ahmedabad", 9, 233, 4.8, "Gujarati, Hindi, English"),
  t("a02", "Hardik S.", "ahmedabad", 5, 109, 4.7, "Gujarati, Hindi", ["morning", "afternoon"]),
  t("a03", "Irfan M.", "ahmedabad", 4, 0, null, "Gujarati, Hindi, Urdu"),
];

export const getTechnician = (id: string) => TECHNICIANS.find((x) => x.id === id);
export const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

// Stand-in for a real calendar: a technician is "booked" on a predictable
// subset of day+slot combinations so the list changes as the customer picks.
const busy = (tech: Technician, day: string, slot: string) => [...(tech.id + day + slot)].reduce((n, c) => n + c.charCodeAt(0), 0) % 4 === 0;
const score = (x: Technician) => (x.rating ?? 4.4) * Math.log(x.jobs + 8);

// Everyone who covers this city and is free in this slot (unordered).
export function availableFor(city: string, day: string, slot: string, roster: Technician[] = TECHNICIANS): Technician[] {
  const inCity = roster.filter((x) => x.city === city && x.slots.includes(slot));
  const free = inCity.filter((x) => !busy(x, day, slot));
  return free.length ? free : inCity;
}

// Offline fallback ordering, used until live ratings load from /api/technicians.
export function techniciansFor(city: string, day: string, slot: string): Technician[] {
  return availableFor(city, day, slot)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3);
}
