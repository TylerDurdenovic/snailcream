"use client";

import { adminDeleteOrder } from "@/app/actions/orders";

export default function DeleteOrderButton({ id }: { id: string }) {
  return (
    <form
      action={adminDeleteOrder}
      onSubmit={(e) => {
        if (!confirm("Delete this order and its invoice? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Delete order
      </button>
    </form>
  );
}
