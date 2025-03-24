import React from "react";
import { type LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

export function Icon({
  icon: LucideIcon,
  size = 24,
  className = "",
}: IconProps) {
  return <LucideIcon size={size} className={className} />;
}
