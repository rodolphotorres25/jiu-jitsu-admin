import React from 'react';
// Fix: Add file extension to local import.
import { Belt, Stripe, BeltType } from '../types.ts';

interface BeltIndicatorProps {
  belt: Belt;
  stripes: Stripe;
  size?: 'sm' | 'md' | 'lg';
  hideStripes?: boolean;
}

const BeltIndicator: React.FC<BeltIndicatorProps> = ({ belt, stripes, size = 'md', hideStripes = false }) => {
  const isBlackBelt = belt.name.toLowerCase().includes('preta') || belt.name.toLowerCase().includes('coral') || belt.name.toLowerCase().includes('vermelha');
  
  const heightClasses = { sm: 'h-5', md: 'h-6', lg: 'h-8' };
  const textClasses = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  
  const stripeColorOnTag = isBlackBelt ? 'bg-red-500' : 'bg-white';
  const tagColor = isBlackBelt ? 'bg-red-600' : 'bg-black';

  const isSplitBelt = belt.type === BeltType.Kid && (belt.name.includes(' e Branca') || belt.name.includes(' e Preta'));

  let beltStyle: React.CSSProperties = {};
  let labelColorSource = belt.color;

  if (isSplitBelt) {
    let baseColor = '';
    const stripeColor = belt.name.includes(' e Branca') ? '#FFFFFF' : '#000000';

    if (belt.name.includes('Cinza')) baseColor = '#808080';
    else if (belt.name.includes('Amarela')) baseColor = '#FFFF00';
    else if (belt.name.includes('Laranja')) baseColor = '#FFA500';
    else if (belt.name.includes('Verde')) baseColor = '#008000';
    
    if (baseColor) {
        beltStyle = {
          background: `linear-gradient(to bottom, ${baseColor} 0%, ${baseColor} 40%, ${stripeColor} 40%, ${stripeColor} 60%, ${baseColor} 60%, ${baseColor} 100%)`
        };
        labelColorSource = baseColor;
    } else {
        // Fallback for any belts missed
        beltStyle = { backgroundColor: belt.color };
    }
  } else {
    beltStyle = { backgroundColor: belt.color };
  }
  
  const lightColors = ['#FFFFFF', '#CCCCCC', '#FFFFCC', '#FFFF00', '#FFDDC1', '#D4EDD4'];
  let finalTextColor = labelColorSource;

  if (lightColors.includes(labelColorSource)) {
    finalTextColor = '#334155'; // slate-700
  } else if (labelColorSource === '#000000') {
    finalTextColor = '#FFFFFF';
  }


  return (
    <div className="flex flex-col items-center">
      <div className={`flex items-center w-48 ${heightClasses[size]}`} style={beltStyle}>
        <div className={`h-full w-12 ${tagColor} flex items-center justify-end pr-1`}>
            {!hideStripes && Array.from({ length: stripes }).map((_, i) => (
                <div key={i} className={`h-full w-1 ${stripeColorOnTag} mx-px`}></div>
            ))}
        </div>
      </div>
      <p className={`mt-1 font-semibold ${textClasses[size]}`} style={{ color: finalTextColor }}>{belt.name}</p>
    </div>
  );
};

export default BeltIndicator;
