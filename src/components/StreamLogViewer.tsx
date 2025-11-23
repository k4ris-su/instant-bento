import React, { memo, useEffect, useRef } from 'react';

interface StreamLogViewerProps {
  log: string;
}

const StreamLogViewer = memo(({ log }: StreamLogViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <div className="bg-black/50 rounded-sm p-6 font-mono text-sm overflow-hidden border border-white/5 h-64">
      <div className="flex items-center gap-2 mb-2 text-green-400">
        <span className="animate-pulse">●</span>
        <span className="font-bold">AI Agent Thinking...</span>
      </div>
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto text-zinc-500 whitespace-pre-wrap scrollbar-hide text-xs pb-8"
      >
        {log || "Initializing agent..."}
      </div>
    </div>
  );
});

StreamLogViewer.displayName = 'StreamLogViewer';

export default StreamLogViewer;
