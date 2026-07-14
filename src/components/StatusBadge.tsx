import { STATUS_STYLES } from "@/lib/shop";

export default function StatusBadge({ status }: { status: string }) {
  const style =
    STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {status}
    </span>
  );
}
