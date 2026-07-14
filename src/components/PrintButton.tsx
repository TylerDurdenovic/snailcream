"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full border border-emerald-900/15 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-50"
    >
      🖨️ Print / PDF
    </button>
  );
}
