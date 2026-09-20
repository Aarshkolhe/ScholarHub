'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { cn } from '../../lib/utils';

function DockNavItem({
  children,
  className = '',
  onClick,
  mouseY,
  spring,
  distance,
  magnificationScale,
  active,
}) {
  const ref = useRef(null);

  const mouseDistance = useTransform(mouseY, (val) => {
    if (!ref.current) return Infinity;
    const rect = ref.current.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    return val - centerY;
  });

  const targetScale = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [1, magnificationScale, 1]
  );
  const scale = useSpring(targetScale, spring);

  const targetX = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [0, 6, 0]
  );
  const x = useSpring(targetX, spring);

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{
        scale,
        x,
      }}
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors duration-200 outline-none origin-left',
        active
          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
        className
      )}
    >
      {children}
    </motion.button>
  );
}

export default function VerticalDock({
  items,
  activeTab,
  onSelectTab,
  className = '',
  spring = { mass: 0.1, stiffness: 220, damping: 16 },
  magnificationScale = 1.08,
  distance = 140,
}) {
  const mouseY = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseY.set(e.clientY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn('flex flex-col gap-1.5 w-full', className)}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <DockNavItem
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            mouseY={mouseY}
            spring={spring}
            distance={distance}
            magnificationScale={magnificationScale}
            active={isActive}
            className={item.className}
          >
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-xl transition-transform duration-200',
                isActive
                  ? 'bg-white/20 text-white backdrop-blur-xs'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400'
              )}
            >
              <Icon className="size-4.5" />
            </div>
            <span className="truncate">{item.label}</span>
            {isActive && (
              <span className="ml-auto size-2 rounded-full bg-white animate-pulse shrink-0" />
            )}
          </DockNavItem>
        );
      })}
    </div>
  );
}
