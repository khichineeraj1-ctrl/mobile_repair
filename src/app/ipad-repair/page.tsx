import { DeviceHub, hubMeta } from "@/components/DevicePages";

export const metadata = hubMeta("ipad");

export default function Page() {
  return <DeviceHub kind="ipad" />;
}
