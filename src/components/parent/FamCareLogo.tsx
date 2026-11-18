import React from "react";

interface FamCareLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideTagline?: boolean;
}

export const FamCareLogo: React.FC<FamCareLogoProps> = ({
  className = "",
  size = "md",
  hideTagline = false,
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const subTextSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Heart + Family Icon matching reference designs */}
      <div
        className={`${iconSizes[size]} rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-[#159FA6] to-[#087B88] text-white shadow-sm shadow-[#159FA6]/20 p-2`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Outer Protective Heart */}
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          {/* Family figures inside */}
          <circle cx="12" cy="10" r="1.5" fill="currentColor" stroke="none" />
          <path d="M9.5 14a2.5 2.5 0 0 1 5 0" strokeWidth="1.5" />
          <circle cx="8" cy="11.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="16" cy="11.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span
          className={`font-black tracking-tight leading-none text-[#102443] dark:text-white ${textSizes[size]}`}
        >
          FAMCARE<span className="text-[#159FA6]">360</span>
        </span>
        {!hideTagline && (
          <span
            className={`font-medium text-[#60738F] dark:text-[#A0B0C0] tracking-normal leading-tight mt-0.5 ${subTextSizes[size]}`}
          >
            Family Health Connect
          </span>
        )}
      </div>
    </div>
  );
};

export default FamCareLogo;
