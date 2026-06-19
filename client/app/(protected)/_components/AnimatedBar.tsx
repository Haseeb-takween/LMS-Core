"use client";

import { useEffect, useState } from "react";

interface AnimatedBarProps {
  percent: number;
  color?: string;
  height?: string;
}

export default function AnimatedBar({
  percent,
  color = "#1d4ed8",
  height = "3px",
}: AnimatedBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);

  return (
    <div
      className="w-full bg-secondary overflow-hidden rounded-full relative"
      style={{ height }}
    >
      <div
        className="rounded-full relative overflow-hidden"
        style={{
          width: `${width}%`,
          height: "100%",
          background: color,
          transition: "width 1s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {/* Shimmer overlay */}
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)`,
            backgroundSize: "200% 100%",
          }}
        />
      </div>
    </div>
  );
}
