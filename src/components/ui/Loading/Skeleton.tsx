import React from 'react';

export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  className = '',
  circle = false,
}: SkeletonProps) {
  const circleClass = circle ? 'rounded-full' : 'rounded';
  
  return (
    <div
      className={`animate-pulse bg-gray-200 ${circleClass} ${className}`}
      style={{ width, height }}
    />
  );
}
