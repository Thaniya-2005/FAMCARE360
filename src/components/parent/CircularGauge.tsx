import React from "react";

interface CircularGaugeProps {
  score: number; // 0 - 100
  label?: string;
  size?: number; // width & height in px
  strokeWidth?: number;
  className?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score,
  label = "Health Score",
  size = 130,
  strokeWidth = 10,
  className = "",
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E6F8F7"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-teal-950/40"
        />
        {/* Active progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#159FA6"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Centered Score & Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
        <span className="text-2xl font-black text-[#102443] dark:text-white leading-none tracking-tight">
          {clampedScore}%
        </span>
        {label && (
          <span className="text-[11px] font-medium text-[#60738F] dark:text-[#A0B0C0] leading-tight mt-1 max-w-[80px]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default CircularGauge;
