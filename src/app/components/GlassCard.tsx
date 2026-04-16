import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export default function GlassCard({ children, className, animate = true }: GlassCardProps) {
  const Card = animate ? motion.div : 'div';
  
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Card
      className={cn(
        'relative overflow-hidden rounded-[24px] backdrop-blur-md',
        'bg-white/80 shadow-xl border border-white/20',
        'hover:shadow-2xl transition-shadow duration-300',
        className
      )}
      {...animationProps}
    >
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </Card>
  );
}
