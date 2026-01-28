import React from 'react';

export default function SerifText({ children, className = '' }) {
  return (
    <h1 className={`font-serif text-6xl md:text-8xl lg:text-[10rem] leading-none ${className}`}>
      {children}
    </h1>
  );
}
