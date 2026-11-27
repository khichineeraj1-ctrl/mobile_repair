import { DeviceHub, hubMeta } from "@/components/DevicePages";

export const metadata = hubMeta("watch");

export default function Page() {
  return <DeviceHub kind="watch" />;
}
