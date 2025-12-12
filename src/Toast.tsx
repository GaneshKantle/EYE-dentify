import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ToastProps } from "./types";
import { CheckCircle, XCircle, X } from "lucide-react";

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-3 right-3 sm:top-4 sm:right-4 md:top-5 md:right-5 lg:top-6 lg:right-6 z-[9999] 
                   max-w-[calc(100vw-1.5rem)] sm:max-w-sm md:max-w-md"
      >
        <div
          className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-2xl
                     border-2 backdrop-blur-sm
                     ${
                       type === "success"
                         ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-900"
                         : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-900"
                     }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {type === "success" ? (
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            ) : (
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            )}
          </div>
          <p className="flex-1 text-xs sm:text-sm md:text-base font-medium leading-relaxed pr-1">
            {message}
          </p>
          <button
            onClick={onClose}
            className={`flex-shrink-0 p-1 rounded-md transition-colors duration-200 hover:bg-black/10
                       ${
                         type === "success"
                           ? "text-emerald-700 hover:text-emerald-900"
                           : "text-red-700 hover:text-red-900"
                       }`}
            aria-label="Close toast"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
