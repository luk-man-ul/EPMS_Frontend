import React from 'react';
import { Skeleton } from './Skeleton';

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className = '',
}: TableSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {[...Array(columns)].map((_, i) => (
          <Skeleton key={`header-${i}`} height="2rem" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex space-x-4">
          {[...Array(columns)].map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} height="3rem" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
