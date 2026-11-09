import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  tex: string;
  displayMode?: boolean;
  className?: string;
}

export const MathFormula: React.FC<MathFormulaProps> = ({ 
  tex, 
  displayMode = true, 
  className = '' 
}) => {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      // Clean up common edge cases in raw latex strings
      const cleaned = tex.trim();
      return katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return '';
    }
  }, [tex, displayMode]);

  if (!html) {
    return <span className={`font-mono text-xs ${className}`}>{tex}</span>;
  }

  return (
    <span
      className={`katex-render ${displayMode ? 'block text-center py-1 overflow-x-auto scrollbar-none' : 'inline-block align-middle'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
