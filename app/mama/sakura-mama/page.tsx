import { redirect } from "next/navigation";

// ママもさくらママに相談できる。Cast sakura-mama page をそのまま使う。
export default function MamaSakuraMamaPage({
  searchParams,
}: {
  searchParams: { customerId?: string };
}) {
  const qs = searchParams.customerId
    ? `?customerId=${searchParams.customerId}`
    : "";
  redirect(`/cast/sakura-mama${qs}`);
}
