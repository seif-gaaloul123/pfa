import React from 'react';

function Icon({ children, className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

export function LayoutDashboard(props) {
  return (
    <Icon {...props}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </Icon>
  );
}

export function Users(props) {
  return (
    <Icon {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function Columns3(props) {
  return (
    <Icon {...props}>
      <path d="M5 3v18" />
      <path d="M12 3v18" />
      <path d="M19 3v18" />
    </Icon>
  );
}

export function FolderOpen(props) {
  return (
    <Icon {...props}>
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </Icon>
  );
}

export function Stethoscope(props) {
  return (
    <Icon {...props}>
      <path d="M4.8 2.3A.3.3 0 0 0 5 3v5.1a9 9 0 0 0 3 6.9" />
      <path d="M19.8 2.3A.3.3 0 0 1 20 3v5.1a9 9 0 0 1-3 6.9" />
      <path d="M9.5 14a5 5 0 0 0 5 5" />
      <path d="M14.1 2.3a.3.3 0 0 1 .2.2v5.1a9 9 0 0 1-3 6.9" />
    </Icon>
  );
}
