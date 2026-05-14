import React from 'react';
 

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

/**
 * IMPACT R&D Logo Component
 * Uses the official brand logo
 */
export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  width,
  height 
}) => {
  return (
    <img
      src="/images/logos/impact.png"
      alt="IMPACT R&D Logo"
      className={className}
      style={{
        width: width ? `${width}px` : undefined,
        height: height ? `${height}px` : undefined,
      }}
    />
  );
};