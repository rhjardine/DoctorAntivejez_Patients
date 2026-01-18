
import React from 'react';
import { Info } from 'lucide-react';
import { COLORS } from '../types';

interface BiologicalAgeSliderProps {
  biologicalAge: number;
  chronologicalAge: number;
  completedItems: number;
  totalItems: number;
  onInfoPress?: () => void;
}

const BiologicalAgeSlider: React.FC<BiologicalAgeSliderProps> = ({ 
  biologicalAge, 
  chronologicalAge,
  completedItems, 
  totalItems,
  onInfoPress
}) => {
  const calculatePercentage = (age: number) => {
    if (age <= 7) return 0;
    if (age >= 120) return 100;
    if (age <= 28) return ((age - 7) / 21) * 25;
    if (age <= 49) return 25 + ((age - 28) / 21) * 25;
    if (age <= 70) return 50 + ((age - 49) / 21) * 25;
    return 75 + ((age - 70) / 50) * 25;
  };

  const percentagePosition = calculatePercentage(biologicalAge);
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="w-full px-4 py-4 bg-white border-b border-gray-100">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-textMedium uppercase">
            {completedItems}/{totalItems} Items | {progressPercentage}%
          </span>
        </div>
        <div className="text-right flex items-center gap-2">
          <span className="text-xs font-bold text-darkBlue">
            Edad Bio: <span className="text-primary text-base">{biologicalAge}</span>
            <span className="text-textLight font-normal ml-1">/ {chronologicalAge}</span>
          </span>
          {onInfoPress && (
            <button 
              onClick={onInfoPress}
              className="p-1 text-slate-300 hover:text-primary transition-colors"
            >
              <Info size={14} />
            </button>
          )}
        </div>
      </div>
      
      <div className="relative h-8 mt-2">
        {/* Color Segments */}
        <div className="h-3 w-full flex rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-accentGreen" style={{ width: '25%' }}></div>
          <div className="h-full bg-accentYellow" style={{ width: '25%' }}></div>
          <div className="h-full bg-accentOrange" style={{ width: '25%' }}></div>
          <div className="h-full bg-accentRed" style={{ width: '25%' }}></div>
        </div>

        {/* Ticks */}
        <div className="absolute w-full flex justify-between text-[10px] text-textLight mt-1 font-bold">
          <span>7</span>
          <span className="absolute left-[25%] -translate-x-1/2">28</span>
          <span className="absolute left-[50%] -translate-x-1/2">49</span>
          <span className="absolute left-[75%] -translate-x-1/2">70</span>
          <span>120</span>
        </div>

        {/* Pointer */}
        <div 
          className="absolute top-2 transition-all duration-700 ease-out z-10"
          style={{ left: `${percentagePosition}%`, transform: 'translateX(-50%)' }}
        >
          <div 
            className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-accentRed"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BiologicalAgeSlider;
