import { motion } from 'framer-motion';
import { Dialog, DialogContent } from './ui/dialog';
import { GetStartedButton } from './ui/get-started-button';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username: string;
}

export function WelcomeModal({ open, onOpenChange, username }: WelcomeModalProps) {
  const handleClose = () => {
    localStorage.setItem('welcomeShown', 'true');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm sm:max-w-md bg-white border border-slate-200 shadow-xl p-0 overflow-hidden rounded-2xl sm:rounded-3xl [&>button]:hidden">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-6 sm:p-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="mb-4"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mb-3 rounded-full">
                  <img src="/favicon.png" alt="EYE'dentify" className="w-full h-full object-contain" />
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="text-xl sm:text-2xl font-semibold text-slate-900 mb-1"
              >
                Welcome, <span className="text-red-600">{username}</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-sm sm:text-base text-slate-600 mb-4"
              >
                to <span className="text-red-600 font-medium">EYE'dentify</span>
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6"
              >Start exploring our advanced <span className="text-red-500 font-medium">Forensic Face Construction and Recognition </span> tools.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex justify-center"
              >
                <GetStartedButton onClick={handleClose} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

