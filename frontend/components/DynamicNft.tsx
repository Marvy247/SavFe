"use client";

import React from 'react';

interface DynamicNftProps {
  level: number;
  points: number;
}

const MAX_LEVEL = 20;
const MAX_POINTS_FOR_GLYPHS = 5000;

// Helper function to determine colors based on level
const getLevelColors = (level: number) => {
  if (level <= 5) return { primary: '#CD7F32', secondary: '#a06426', glow: '#eda14a' }; // Bronze
  if (level <= 10) return { primary: '#C0C0C0', secondary: '#a0a0a0', glow: '#e0e0e0' }; // Silver
  if (level <= 15) return { primary: '#FFD700', secondary: '#c8a900', glow: '#ffee77' }; // Gold
  return { primary: '#B9F2FF', secondary: '#8ac8d8', glow: '#e3ffff' }; // Diamond
};

// Helper to determine which glyphs are visible based on points
const getVisibleGlyphs = (points: number) => {
  const visibleCount = Math.floor((points / MAX_POINTS_FOR_GLYPHS) * 6); // 6 glyphs in total
  return Array.from({ length: 6 }, (_, i) => i < visibleCount);
};

export default function DynamicNft({ level, points }: DynamicNftProps) {
  const colors = getLevelColors(level);
  const visibleGlyphs = getVisibleGlyphs(points);

  const glyphPaths = [
    "M 50 15 L 55 25 L 45 25 Z", // Top triangle
    "M 50 85 L 55 75 L 45 75 Z", // Bottom triangle
    "M 20 35 L 25 40 L 20 45 L 15 40 Z", // Left diamond
    "M 80 35 L 85 40 L 80 45 L 75 40 Z", // Right diamond
    "M 20 65 L 25 60 L 20 55 L 15 60 Z", // Bottom-left diamond
    "M 80 65 L 85 60 L 80 55 L 75 60 Z", // Bottom-right diamond
  ];

  return (
    <div className="w-full h-full flex items-center justify-center bg-card rounded-lg p-4">
      <svg viewBox="0 0 100 100" className="w-64 h-64 drop-shadow-lg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Shield */}
        <path
          d="M 50 2 C 20 2, 10 30, 10 50 C 10 70, 20 98, 50 98 C 80 98, 90 70, 90 50 C 90 30, 80 2, 50 2 Z"
          fill={colors.secondary}
          stroke={colors.primary}
          strokeWidth="1"
        />
        <path
          d="M 50 5 C 25 5, 15 30, 15 50 C 15 70, 25 95, 50 95 C 75 95, 85 70, 85 50 C 85 30, 75 5, 50 5 Z"
          fill={colors.primary}
          stroke={colors.secondary}
          strokeWidth="0.5"
        />

        {/* Level Indicator - Roman Numerals */}
        <text
          x="50"
          y="55"
          textAnchor="middle"
          fontSize="24"
          fill={colors.secondary}
          fontFamily="serif"
          fontWeight="bold"
        >
          {level > 0 ? toRoman(level) : 'I'}
        </text>

        {/* Glyphs that appear based on points */}
        {glyphPaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill={colors.glow}
            opacity={visibleGlyphs[i] ? 1 : 0.2}
            style={{ transition: 'opacity 0.5s ease-in-out' }}
            filter={visibleGlyphs[i] ? "url(#glow)" : "none"}
          />
        ))}
      </svg>
    </div>
  );
}

// Function to convert number to Roman numeral
function toRoman(num: number): string {
    if (num < 1 || num > 39) return String(num); // Simple implementation for levels 1-39
    const roman = [
        { value: 10, char: 'X' },
        { value: 9, char: 'IX' },
        { value: 5, char: 'V' },
        { value: 4, char: 'IV' },
        { value: 1, char: 'I' },
    ];
    let result = '';
    for (const { value, char } of roman) {
        while (num >= value) {
            result += char;
            num -= value;
        }
    }
    return result;
}
