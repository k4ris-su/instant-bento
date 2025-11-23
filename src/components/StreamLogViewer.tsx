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
    <div className="relative group">
      {/* Pixel Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#32f08c] -translate-x-[1px] -translate-y-[1px] z-10" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#32f08c] translate-x-[1px] -translate-y-[1px] z-10" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#32f08c] -translate-x-[1px] translate-y-[1px] z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#32f08c] translate-x-[1px] translate-y-[1px] z-10" />

      <div className="bg-black/80 backdrop-blur-md rounded-sm p-6 font-mono text-sm overflow-hidden border border-[#32f08c]/20 h-64 relative">
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]" />

        <div className="relative z-10 flex items-center justify-between mb-4 border-b border-[#32f08c]/20 pb-2">
          <div className="flex items-center gap-2 text-[#32f08c]">
            <span className="animate-pulse">●</span>
            <span className="font-bold tracking-wider uppercase text-xs">System_Log_Stream</span>
          </div>
          <div className="text-[10px] text-[#32f08c]/50">v1.0.0</div>
        </div>

        <div
          ref={scrollRef}
          className="relative z-10 h-[calc(100%-2rem)] overflow-y-auto text-zinc-400 whitespace-pre-wrap scrollbar-hide text-xs pb-8 font-mono leading-relaxed"
        >
          {log ? (
            <>
              <span className="text-[#32f08c]">{`>`}</span> {log}
              <span className="animate-pulse inline-block w-2 h-4 bg-[#32f08c] ml-1 align-middle" />
            </>
          ) : (
            <span className="text-zinc-600 italic">Waiting for input stream...</span>
          )}
        </div>
      </div>
    </div>
  );
});

StreamLogViewer.displayName = 'StreamLogViewer';

export default StreamLogViewer;
