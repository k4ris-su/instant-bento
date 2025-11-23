import React, { memo } from 'react';
import PixelBlast from "@/components/PixelBlast";

// Background Components
import Plasma from "@/components/Plasma";
import Aurora from "@/components/Aurora";
import ColorBends from "@/components/ColorBends";
import Silk from "@/components/Silk";
import DarkVeil from "@/components/DarkVeil";
import Prism from "@/components/Prism";
import LiquidEther from "@/components/LiquidEther";
import Iridescence from "@/components/Iridescence";

const BACKGROUNDS = [
  { component: Plasma, props: { className: "opacity-50" } },
  { component: Aurora, props: { className: "opacity-50" } },
  { component: ColorBends, props: { className: "opacity-50" } },
  { component: Silk, props: { className: "opacity-50" } },
  { component: DarkVeil, props: { className: "opacity-50" } },
  { component: Prism, props: { className: "opacity-50" } },
  { component: LiquidEther, props: { className: "opacity-50" } },
  { component: Iridescence, props: { className: "opacity-50", color: [1, 1, 1] } },
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
