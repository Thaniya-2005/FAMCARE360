import React from "react";

interface ChildCircularGaugeProps {
  score: number; // 0 - 100
  label?: string;
  size?: number; // width & height in px
  strokeWidth?: number;
  className?: string;
  gradientId?: string;
}

export const ChildCircularGauge: React.FC<ChildCircularGaugeProps> = ({
  score,
  label = "Wellness Score",
  size = 130,
  strokeWidth = 10,
  className = "",
  gradientId = "childGaugeGrad",
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
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5369D7" />
            <stop offset="100%" stopColor="#8960D0" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAF0FF"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="dark:stroke-purple-950/40"
        />
        {/* Active progress track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
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
        <span className="text-2xl font-black text-[#172443] dark:text-white leading-none tracking-tight">
          {clampedScore}%
        </span>
        {label && (
          <span className="text-[11px] font-medium text-[#64718B] dark:text-[#A0B0C0] leading-tight mt-1 max-w-[85px]">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChildCircularGauge;
