import React from 'react';

export interface DeviceIconProps {
  className?: string;
  size?: number;
  color?: string;
  glow?: boolean;
}

// 1. Laptop Component Icon
export const LaptopIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Screen Frame */}
      <rect
        x="8"
        y="8"
        width="32"
        height="22"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Screen Glass */}
      <rect
        x="11"
        y="11"
        width="26"
        height="16"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="2 1"
        fill="none"
      />
      {/* Screen Content Graphic / Code Lines */}
      <path
        d="M15 16H25M15 20H21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Base / Keyboard */}
      <path
        d="M4 34C4 32.8954 4.89543 32 6 32H42C43.1046 32 44 32.8954 44 34L45 37C45 38.1046 44.1046 39 43 39H5C3.89543 39 3 38.1046 3 37L4 34Z"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Trackpad notch */}
      <path
        d="M20 33H28"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Antenna pulse dot */}
      <circle cx="24" cy="6" r="1.5" fill={color} />
    </svg>
  );
};

// 2. Smartphone Component Icon
export const SmartphoneIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Phone Body */}
      <rect
        x="13"
        y="5"
        width="22"
        height="38"
        rx="4"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Screen Glass */}
      <rect
        x="16"
        y="10"
        width="16"
        height="26"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Speaker / Notch */}
      <line
        x1="21"
        y1="7.5"
        x2="27"
        y2="7.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Home / Touch Indicator */}
      <circle cx="24" cy="39" r="1.5" fill={color} />
      {/* Signal Bars inside */}
      <rect x="25" y="13" width="1.5" height="4" fill={color} rx="0.5" />
      <rect x="28" y="11" width="1.5" height="6" fill={color} rx="0.5" />
    </svg>
  );
};

// 3. Tablet Component Icon
export const TabletIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Tablet Body */}
      <rect
        x="9"
        y="6"
        width="30"
        height="36"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Inner Screen */}
      <rect
        x="12"
        y="10"
        width="24"
        height="28"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Front Camera */}
      <circle cx="24" cy="8" r="1" fill={color} />
      {/* Grid Content */}
      <path
        d="M16 16H24M16 20H32M16 24H28"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// 4. Base Station / Tower Component Icon
export const BaseStationIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Tower Lattice Legs */}
      <path
        d="M24 10L14 42M24 10L34 42"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lattice Crossbraces */}
      <path
        d="M19 22H29M16.5 30H31.5M14.5 38H33.5"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M19 22L29 30M29 22L16.5 30M16.5 30L33.5 38M31.5 30L14.5 38"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.8"
      />
      {/* Tower Mast & Emitter Point */}
      <line x1="24" y1="4" x2="24" y2="10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="4" r="2.5" fill={color} />
      {/* RF Radiation Arcs (Left & Right) */}
      <path
        d="M17 5C15 7.5 15 11 17 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 2C9 6 9 12.5 12 16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />
      <path
        d="M31 5C33 7.5 33 11 31 13.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M36 2C39 6 39 12.5 36 16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 1.5"
      />
      {/* Base platform */}
      <line x1="10" y1="42" x2="38" y2="42" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

// 5. Router / Switch Component Icon
export const RouterIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Chassis Body */}
      <rect
        x="6"
        y="22"
        width="36"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Front Panel RJ45 ports / status LEDs */}
      <circle cx="12" cy="31" r="2" fill={color} />
      <circle cx="18" cy="31" r="2" fill={color} />
      <circle cx="24" cy="31" r="2" fill={color} />
      <circle cx="30" cy="31" r="2" fill={color} />
      <circle cx="36" cy="31" r="1.5" stroke={color} strokeWidth="1" />
      {/* Antennas */}
      <path
        d="M12 22V10M24 22V7M36 22V10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="9" r="1.5" fill={color} />
      <circle cx="24" cy="6" r="1.5" fill={color} />
      <circle cx="36" cy="9" r="1.5" fill={color} />
      {/* Feet */}
      <rect x="10" y="40" width="4" height="2" fill={color} />
      <rect x="34" y="40" width="4" height="2" fill={color} />
    </svg>
  );
};

// 6. Server Rack / Monitor Component Icon
export const ServerIcon: React.FC<DeviceIconProps> = ({
  className = '',
  size = 32,
  color = 'currentColor',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? 'drop-shadow-[0_0_8px_currentColor]' : ''}`}
    >
      {/* Outer Cabinet Rack */}
      <rect
        x="9"
        y="5"
        width="30"
        height="38"
        rx="2"
        stroke={color}
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.06"
      />
      {/* Unit 1 */}
      <rect x="13" y="9" width="22" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="12.5" r="1" fill={color} />
      <line x1="22" y1="12.5" x2="31" y2="12.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Unit 2 */}
      <rect x="13" y="19" width="22" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="22.5" r="1" fill={color} />
      <line x1="22" y1="22.5" x2="31" y2="22.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Unit 3 */}
      <rect x="13" y="29" width="22" height="7" rx="1" stroke={color} strokeWidth="1.5" />
      <circle cx="17" cy="32.5" r="1" fill={color} />
      <line x1="22" y1="32.5" x2="31" y2="32.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Ventilation slots at bottom */}
      <line x1="16" y1="39" x2="32" y2="39" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
    </svg>
  );
};
