import { DeviceHub, hubMeta } from "@/components/DevicePages";

export const metadata = hubMeta("mac");

export default function Page() {
  return <DeviceHub kind="mac" />;
}
