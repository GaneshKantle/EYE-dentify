/*eslint-disable*/
import React, { useState } from 'react';
import { Twitter, Github, Linkedin, ArrowUpRight, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

//================================================================================
// Types
//================================================================================

export interface SocialLink {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface ActionButtonProps {
  text: string;
  href: string;
}

export interface GlassmorphismProfileCardProps {
  avatarUrl: string;
  name: string;
  title: string;
  // bio: string;
  socialLinks?: SocialLink[];
  actionButton?: ActionButtonProps;
}

//================================================================================
// Main Component
//================================================================================

/**
 * Glassmorphism Profile Card Component
 * A responsive, animated, and themeable profile card with a glassmorphism effect.
 */
export const GlassmorphismProfileCard = React.memo<GlassmorphismProfileCardProps>(({
  avatarUrl,
  name,
  title,
  // bio,
  socialLinks = [],
  actionButton,
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-sm mx-auto h-full">
      <div 
        className="relative flex flex-col items-center p-6 sm:p-8 rounded-3xl border transition-all duration-500 ease-out backdrop-blur-xl bg-card/40 border-white/10 h-full"
        style={{
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="w-20 h-20 sm:w-24 sm:h-24 mb-4 rounded-full p-1 border-2 border-white/20 flex-shrink-0">
          <img 
            src={avatarUrl} 
            alt={`${name}'s Avatar`}
            className="w-full h-full rounded-full object-cover"
            loading="lazy"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              target.onerror = null; 
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=128`; 
            }}
          />
        </div>
        <div className="w-full min-h-[3rem] sm:min-h-[3.5rem] flex flex-col items-center justify-center mb-1">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground text-center break-words px-2 leading-tight">{name}</h2>
        </div>
        <div className="w-full min-h-[2rem] sm:min-h-[2.25rem] flex items-center justify-center mb-1">
          <p className="text-xs sm:text-sm font-medium text-primary text-center break-words px-2 leading-tight">{title}</p>
        </div>
        <div className="w-1/2 h-px my-4 sm:my-6 rounded-full bg-border flex-shrink-0" />
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap flex-shrink-0">
          {socialLinks.map((item) => (
            <SocialButton 
              key={item.id} 
              item={item} 
              setHoveredItem={setHoveredItem} 
              hoveredItem={hoveredItem} 
            />
          ))}
        </div>
        {actionButton && <div className="mt-auto pt-4 flex-shrink-0"><ActionButton action={actionButton} /></div>}
      </div>
      <div className="absolute inset-0 rounded-3xl -z-10 transition-all duration-500 ease-out blur-2xl opacity-30 bg-gradient-to-r from-indigo-500/50 to-purple-500/50" />
    </div>
  );
});

GlassmorphismProfileCard.displayName = 'GlassmorphismProfileCard';

//================================================================================
// Sub-components
//================================================================================

interface SocialButtonProps {
  item: SocialLink;
  setHoveredItem: (id: string | null) => void;
  hoveredItem: string | null;
}

const SocialButton = React.memo<SocialButtonProps>(({ item, setHoveredItem, hoveredItem }) => (
  <div className="relative">
    <a
      href={item.href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-300 ease-out group overflow-hidden bg-secondary/50 hover:bg-secondary"
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      aria-label={item.label}
    >
      <div className="relative z-10 flex items-center justify-center">
        <item.icon size={18} className="sm:w-5 sm:h-5 transition-all duration-200 ease-out text-secondary-foreground/70 group-hover:text-secondary-foreground" />
      </div>
    </a>
    <Tooltip item={item} hoveredItem={hoveredItem} />
  </div>
));

SocialButton.displayName = 'SocialButton';

interface ActionButtonComponentProps {
  action: ActionButtonProps;
}

const ActionButton = React.memo<ActionButtonComponentProps>(({ action }) => (
  <a
    href={action.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95 group bg-primary text-primary-foreground"
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
  >
    <span>{action.text}</span>
    <ArrowUpRight size={14} className="sm:w-4 sm:h-4 transition-transform duration-300 ease-out group-hover:rotate-45" />
  </a>
));

ActionButton.displayName = 'ActionButton';

interface TooltipProps {
  item: SocialLink;
  hoveredItem: string | null;
}

const Tooltip = React.memo<TooltipProps>(({ item, hoveredItem }) => (
  <div 
    role="tooltip"
    className={cn(
      "absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs font-medium whitespace-nowrap transition-all duration-300 ease-out pointer-events-none bg-popover text-popover-foreground border-border",
      hoveredItem === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}
    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
  >
    {item.label}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-popover border-b border-r border-border" />
  </div>
));

Tooltip.displayName = 'Tooltip';
