// ═══════════════════════════════════════════════════════════
// ORENIVO — Review Banner
// Shows after 3 days of use, asks for a CWS review.
// Dismissed permanently once the user clicks either button.
// ═══════════════════════════════════════════════════════════

import { setReviewDismissed } from "@/lib/storage";

interface ReviewBannerProps {
  onDismiss: () => void;
}

export function ReviewBanner({ onDismiss }: ReviewBannerProps) {
  function handleRate() {
    const id = chrome.runtime.id;
    const url = `https://chromewebstore.google.com/detail/${id}/reviews`;
    window.open(url, "_blank");
    setReviewDismissed();
    onDismiss();
  }

  function handleDismiss() {
    setReviewDismissed();
    onDismiss();
  }

  return (
    <div className="mx-2 mb-2 px-3 py-2.5 rounded-lg border border-brand-500/20 bg-brand-500/5 flex flex-col gap-2">
      <p className="text-[12px] text-gray-300 leading-snug">
        Enjoying Orenivo? A quick review helps a lot ⭐
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleRate}
          className="flex-1 text-[11px] font-medium py-1.5 rounded-md bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors"
        >
          Leave a review
        </button>
        <button
          onClick={handleDismiss}
          className="text-[11px] font-medium py-1.5 px-3 rounded-md text-gray-500 hover:text-gray-400 transition-colors"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
