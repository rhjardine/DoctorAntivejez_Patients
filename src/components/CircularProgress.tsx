import React, { useEffect, useState } from 'react';
import { COLORS } from '../types';

interface CircularProgressProps {
  percentage: number;
  label: string;
  icon: React.ReactNode;
  color?: string;
  fillColor?: string;
  size?: number;
  isCenter?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ 
  percentage, 
  label, 
  icon, 
  color = COLORS.PrimaryBlue,
  fillColor,
  size = 100,
  isCenter = false
}) => {
  const [displayedPercentage, setDisplayedPercentage] = useState(0);

  useEffect(() => {
    // Trigger animation after mount or when percentage changes.
    // Initializing at 0 and updating after a tick ensures the transition plays on load.
    const timer = setTimeout(() => {
      setDisplayedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const strokeWidth = isCenter ? 10 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate offset based on the animated state
  const offset = circumference - (displayedPercentage / 100) * circumference;

  // Determine inner circle background color
  const innerBgColor = fillColor 
    ? fillColor 
    : (isCenter ? COLORS.DarkBlue : COLORS.BrightWhite);

  // Determine icon/text color based on background
  const contentColor = (isCenter || fillColor === COLORS.DarkBlue || fillColor === COLORS.PrimaryBlue) 
    ? COLORS.BrightWhite 
    : COLORS.PrimaryBlue;

  return (
    <div className="flex flex-col items-center justify-center p-0.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle (Track) */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.SlightlyDarkerGray}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle (Indicator) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Icon Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
             className="flex flex-col items-center justify-center rounded-full shadow-sm"
             style={{ 
               width: size * 0.75, 
               height: size * 0.75,
               backgroundColor: innerBgColor
             }}
          >
             <div style={{ color: contentColor }} className="mb-0.5">
               {icon}
             </div>
             <span className="text-[10px] font-bold leading-none" style={{ color: contentColor }}>
                {percentage}%
             </span>
          </div>
        </div>
      </div>
      
      {/* Label */}
      <div className="mt-1 text-center min-h-[24px] flex items-start justify-center">
        <span 
          className="text-xs font-medium leading-tight px-1 block w-24"
          style={{ color: COLORS.TextDark }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;