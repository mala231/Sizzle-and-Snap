import React from 'react';

export default function StatusBadge({ status }) {
  const normalizedStatus = (status || '').toLowerCase();

  let bgStyles = '';
  let textStyles = '';
  let pipStyles = '';

  switch (normalizedStatus) {
    case 'pending':
      bgStyles = 'bg-[#ffdcc3] border-[#fd8b00]/10';
      textStyles = 'text-[#603100]';
      pipStyles = 'bg-[#fd8b00] animate-pulse';
      break;
    case 'ready':
      bgStyles = 'bg-[#c8f0d2] border-[#1a6b2a]/10';
      textStyles = 'text-[#0d3d18]';
      pipStyles = 'bg-[#1a6b2a]';
      break;
    case 'completed':
      bgStyles = 'bg-[#e5e2e1] border-[#3a3a3a]/15';
      textStyles = 'text-[#1c1b1b]';
      pipStyles = 'bg-[#3a3a3a]';
      break;
    default:
      bgStyles = 'bg-surface-container border-outline-variant/30';
      textStyles = 'text-on-surface-variant';
      pipStyles = 'bg-on-surface-variant/40';
  }

  return (
    <span className={`inline-flex items-center gap-xs px-md py-xs rounded-full border text-[10px] uppercase font-bold tracking-wider ${bgStyles} ${textStyles}`}>
      <span className={`h-2 w-2 rounded-full ${pipStyles}`} />
      {status}
    </span>
  );
}
