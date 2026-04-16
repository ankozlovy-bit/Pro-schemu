import { motion } from "motion/react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <motion.div
          className="w-16 h-16 border-4 border-[#E8F0E8] border-t-[#2D2D2D] rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-2 h-2 bg-[#2D2D2D] rounded-full" />
        </motion.div>
      </div>
    </div>
  );
}
