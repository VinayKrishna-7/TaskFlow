import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string | null;
  avatarUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return parts[0][0].toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  avatarUrl,
  name = 'User',
  size = 'md',
  className,
}) => {
  const [imageError, setImageError] = useState(false);
  const imageSrc = src || avatarUrl;

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const initials = getInitials(name);

  if (imageSrc && !imageError) {
    return (
      <img
        src={imageSrc}
        alt={name}
        title={name}
        onError={() => setImageError(true)}
        className={cn(
          'rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800 flex-shrink-0',
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      title={name}
      aria-label={name}
      className={cn(
        'rounded-full bg-gradient-to-br from-[#800020] via-[#991B1B] to-[#540015] dark:from-[#BD326D] dark:via-[#992355] dark:to-[#6B1439] text-[#FFFDF9] font-bold flex items-center justify-center select-none shadow-xs flex-shrink-0 tracking-tight ring-1 ring-[#800020]/30 dark:ring-[#992355]/30',
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
};
