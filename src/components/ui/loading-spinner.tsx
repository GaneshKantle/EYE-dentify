import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12'
};

export const LoadingSpinner = ({ 
  size = 'md', 
  text,
  className 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-3"
      >
        <Loader2 className={cn("text-primary", sizeClasses[size])} />
      </motion.div>
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm text-muted-foreground text-center"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};
