
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Optimized visible range calculation
  const visibleRange = useMemo(() => {
    const itemsInView = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      startIndex + itemsInView + overscan * 2
    );
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Memoized visible items to prevent unnecessary recalculations
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // Optimized scroll handler with throttling
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    if (Math.abs(newScrollTop - scrollTop) > itemHeight / 4) {
      setScrollTop(newScrollTop);
    }
  }, [scrollTop, itemHeight]);

  // Prefetch items slightly outside the viewport for smoother scrolling
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const prefetchItems = Math.min(5, items.length);
      
      // Pre-render a few items to improve scroll performance
      for (let i = 0; i < prefetchItems; i++) {
        if (items[i]) {
          const element = document.createElement('div');
          element.style.visibility = 'hidden';
          element.style.position = 'absolute';
          element.style.top = '-9999px';
          renderItem(items[i], i);
        }
      }
    }
  }, [items, renderItem]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ 
        height: containerHeight,
        willChange: 'scroll-position' // Optimize for scrolling
      }}
      onScroll={handleScroll}
    >
      <div 
        style={{ 
          height: totalHeight, 
          position: 'relative',
          contain: 'layout style paint' // Performance optimization
        }}
      >
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            willChange: 'transform' // Optimize for transforms
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.startIndex + index)
          )}
        </div>
      </div>
    </div>
  );
}
