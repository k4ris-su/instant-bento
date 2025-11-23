import React, { memo } from 'react';
import PixelBlast from "@/components/PixelBlast";

// Background Components
import DarkVeil from "@/components/DarkVeil";

const BACKGROUNDS = [
  { component: DarkVeil, props: { className: "opacity-50" } },
];

interface BackgroundLayerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  backgroundComponent: any;
}

const BackgroundLayer = memo(({ backgroundComponent }: BackgroundLayerProps) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {backgroundComponent ? (
         <backgroundComponent.component {...backgroundComponent.props} />
      ) : (
         <PixelBlast color="#32f08c" pixelSize={30} />
      )}
    </div>
  );
});

BackgroundLayer.displayName = 'BackgroundLayer';

export { BackgroundLayer, BACKGROUNDS };
