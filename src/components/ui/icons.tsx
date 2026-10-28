import type { SVGProps } from "react";

// Iconos propios en línea: evitan una dependencia completa para una docena de glifos.
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z" /></Icon>
);
export const TvIcon = (p: IconProps) => (
  <Icon {...p}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="m8.5 2.5 3.5 3.5 3.5-3.5M8 21h8" /></Icon>
);
export const RadioIcon = (p: IconProps) => (
  <Icon {...p}><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M7 8 17 3.5" /><circle cx="15.5" cy="14" r="2.5" /><path d="M6.5 12.5h4M6.5 15.5h4" /></Icon>
);
export const CompassIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></Icon>
);
export const SearchIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Icon>
);
export const PlayIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></Icon>
);
export const PauseIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></Icon>
);
export const VolumeIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></Icon>
);
export const MuteIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="m16 9.5 5 5M21 9.5l-5 5" /></Icon>
);
export const ExpandIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></Icon>
);
export const ArrowLeftIcon = (p: IconProps) => (
  <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>
);
export const RetryIcon = (p: IconProps) => (
  <Icon {...p}><path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" /><path d="M4 4v4.5h4.5" /></Icon>
);
export const SignalOffIcon = (p: IconProps) => (
  <Icon {...p}><path d="M5 12.5a10 10 0 0 1 4-2.4M2 9a14.5 14.5 0 0 1 4.6-3M8.5 16a5 5 0 0 1 5.5-.9M12 20h.01M3 3l18 18M14.5 10.4A10 10 0 0 1 19 12.5M17.6 6.3A14.5 14.5 0 0 1 22 9" /></Icon>
);
