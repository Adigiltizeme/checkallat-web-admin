'use client';

import React, { useState } from 'react';

interface Props {
  title: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  headerActions?: React.ReactNode;
}

export function SectionCard({
  title,
  icon,
  children,
  className,
  collapsible,
  defaultExpanded = true,
  headerActions,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`bg-white p-5 rounded-lg shadow ${className ?? ''}`}>
      <div
        className={`flex justify-between items-center ${collapsible ? 'cursor-pointer select-none' : ''} ${
          expanded ? 'mb-3' : ''
        }`}
        onClick={collapsible ? () => setExpanded(v => !v) : undefined}
      >
        <h2 className="text-lg font-semibold text-gray-900">
          {icon && <span className="mr-1.5">{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {headerActions}
          {collapsible && (
            <button
              className="text-2xl text-gray-400 hover:text-primary leading-none w-7 text-center"
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? '−' : '+'}
            </button>
          )}
        </div>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}
