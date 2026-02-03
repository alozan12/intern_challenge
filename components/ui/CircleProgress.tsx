'use client'

import { useMemo } from 'react'

interface CircleProgressProps {
  progress: number  // 0-100
  size: number      // Size in pixels
  strokeWidth: number // Width of the progress circle
  circleColor: string // Color of the background circle
  progressColor: string // Color of the progress arc
  textColor: string  // Color of the text
  showPercentage?: boolean // Whether to show the percentage
}

export function CircleProgress({
  progress,
  size,
  strokeWidth,
  circleColor,
  progressColor,
  textColor,
  showPercentage = true
}: CircleProgressProps) {
  // Calculate the radius of the circle
  const radius = (size - strokeWidth) / 2;
  
  // Calculate the circumference of the circle
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the stroke-dashoffset based on progress
  const dashOffset = useMemo(() => {
    // Ensure progress is between 0-100
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    return circumference - (circumference * clampedProgress) / 100;
  }, [circumference, progress]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={circleColor}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Text in the middle */}
      {showPercentage && (
        <div
          className="absolute inset-0 flex items-center justify-center font-medium"
          style={{ color: textColor }}
        >
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}