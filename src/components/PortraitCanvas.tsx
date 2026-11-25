import { useEffect, useRef } from 'react';
import { renderPixelPortrait } from '../game/pixelRenderer';
import { Tenant } from '../game/types';

interface PortraitCanvasProps {
  tenant: Tenant;
  size?: number;
  className?: string;
}

export function PortraitCanvas({ tenant, size = 56, className = '' }: PortraitCanvasProps) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      renderPixelPortrait(ref.current, tenant);
    }
  }, [tenant, tenant.satisfaction]);

  return (
    <canvas
      ref={ref}
      width={48}
      height={48}
      style={{ width: size, height: size }}
      className={`pixel-canvas shrink-0 border-2 border-stone-600 bg-stone-800 ${className}`}
    />
  );
}
