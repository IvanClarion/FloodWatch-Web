"use client";

import React from 'react';
import ToogleButtonLayout from '@/components/button/ToogleButtonLayout';
import ToogleButton from '@/components/button/ToogleButton';

export default function HazardMapToogleButton({ activeHazard, onHazardChange }) {
  return (
    <ToogleButtonLayout className="w-full lg:w-sm">
      <ToogleButton
        className={`text-xs ${activeHazard === 'flood' ? 'button-toogle-active' : ''}`}
        onClick={() => onHazardChange('flood')}
      >
        Flood Hazard
      </ToogleButton>

      <ToogleButton
        className={`text-xs ${activeHazard === 'landslide' ? 'button-toogle-active' : ''}`}
        onClick={() => onHazardChange('landslide')}
      >
        Landslide Hazard
      </ToogleButton>
    </ToogleButtonLayout>
  );
}
