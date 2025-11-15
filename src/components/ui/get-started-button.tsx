import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface GetStartedButtonProps {
  onClick?: () => void;
  className?: string;
}

export function GetStartedButton({ onClick, className }: GetStartedButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden",
        "h-11 px-8 rounded-xl",
        "bg-slate-700",
        "text-white font-medium text-sm",
        "border border-slate-600",
        "hover:bg-slate-600",
        "active:scale-95",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      <span className="relative z-20 mr-8 transition-opacity duration-500 group-hover:opacity-0 inline-block whitespace-nowrap">
        Get Started
      </span>
      <span className="absolute right-1 top-1 bottom-1 rounded-lg z-10 grid w-1/4 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
        <ChevronRight size={16} strokeWidth={2} className="text-slate-900" aria-hidden="true" />
      </span>
    </button>
  );
}

