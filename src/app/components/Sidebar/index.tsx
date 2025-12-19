export default function Sidebar(props: { roomId: string }) {
    const { roomId } = props;
    return (
      <div className="flex flex-col h-full gap-4">
        {/* Room Info & Share */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Room
          </h2>
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <span className="font-mono text-sm">{roomId}</span>
            <button onClick={() => navigator.clipboard.writeText(window.location.origin + "/?roomId=" + roomId)} className="text-xs px-2 py-1 rounded-full border border-sky-400/40 text-sky-300 hover:bg-sky-500/10">
              Copy Link
            </button>
          </div>
        </section>
  
        {/* Players */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Players
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 max-h-44 overflow-y-auto">
            {/* map players here */}
          </div>
        </section>
  
        {/* Events */}
        <section className="space-y-2 flex-1">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Events
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-2 flex-1 overflow-y-auto text-xs text-gray-300">
            {/* event feed list */}
          </div>
        </section>
  
        {/* Controls Help */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Controls
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-gray-300 space-y-1">
            <div><span className="font-mono text-gray-100">WASD / Arrows</span> – Move</div>
            <div><span className="font-mono text-gray-100">Shift</span> – Dash (later)</div>
            <div><span className="font-mono text-gray-100">~</span> – Debug overlay</div>
          </div>
        </section>
      </div>
    );
  }
  