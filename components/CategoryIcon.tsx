'use client';

import React from 'react';
import {
  Wind,
  Watch,
  Glasses,
  Sparkles,
  Cpu,
  Flame,
  LayoutGrid,
  Tag,
  Package,
  Layers,
  ShoppingBag,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export default function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  const iconMap: Record<string, React.ReactNode> = {
    Wind: <Wind className={className} />,
    Watch: <Watch className={className} />,
    Glasses: <Glasses className={className} />,
    Sparkles: <Sparkles className={className} />,
    Cpu: <Cpu className={className} />,
    Flame: <Flame className={className} />,
    LayoutGrid: <LayoutGrid className={className} />,
    Tag: <Tag className={className} />,
    Layers: <Layers className={className} />,
    ShoppingBag: <ShoppingBag className={className} />,
  };

  return iconMap[name] || <Package className={className} />;
}
