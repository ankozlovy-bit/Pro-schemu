import { motion } from 'motion/react';
import { Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface InfoCardProps {
  children: ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function InfoCard({ children, type = 'info', className = '' }: InfoCardProps) {
  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const colors = {
    info: {
      bg: 'bg-[#E8F0E8]/30',
      border: 'border-[#E8F0E8]',
      icon: 'text-[#2D2D2D]',
    },
    success: {
      bg: 'bg-[#E8F0E8]/50',
      border: 'border-[#E8F0E8]',
      icon: 'text-[#00A651]',
    },
    warning: {
      bg: 'bg-[#F4E7E7]/50',
      border: 'border-[#F4E7E7]',
      icon: 'text-[#FFD700]',
    },
    error: {
      bg: 'bg-[#F4E7E7]/50',
      border: 'border-[#d4183d]/20',
      icon: 'text-[#d4183d]',
    },
  };

  const Icon = icons[type];
  const colorScheme = colors[type];

  return (
    <motion.div
      className={`flex gap-3 p-4 rounded-[20px] ${colorScheme.bg} border ${colorScheme.border} backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colorScheme.icon}`} />
      <div className="text-sm text-[#2D2D2D] leading-relaxed">{children}</div>
    </motion.div>
  );
}
