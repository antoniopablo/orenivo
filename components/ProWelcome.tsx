import { useStore } from "@/lib/store";

export function ProWelcome() {
  const { dismissUpgrade } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface border border-white/10 rounded-2xl shadow-2xl w-[280px] p-5 space-y-4">
        <div className="text-center space-y-1">
          <div className="text-3xl">🎉</div>
          <h2 className="text-[16px] font-bold text-white">Welcome to Pro!</h2>
          <p className="text-[11px] text-gray-400">Here's what you've unlocked:</p>
        </div>

        <div className="space-y-2.5">
          <Feature icon="📁" title="Unlimited folders & prompts" desc="No more limits — organize everything your way." />
          <Feature icon="☁️" title="Cloud sync" desc="Your folders, conversations and prompts are now backed up and synced to the cloud. Open Orenivo on any device, sign in, and everything is there." />
          <Feature icon="⚡" title="Priority support" desc="Get help faster at support@orenivo.com" />
        </div>

        <p className="text-[10px] text-gray-600 text-center leading-relaxed">
          Sync runs automatically every 5 minutes and when you close the panel.
        </p>

        <button
          onClick={dismissUpgrade}
          className="w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-[13px] font-medium transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="text-[16px] mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-[12px] text-white font-medium">{title}</p>
        <p className="text-[10px] text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
