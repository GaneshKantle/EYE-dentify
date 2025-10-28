import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/badge';

export const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-12 text-center"
    >
      <div className="inline-flex items-center space-x-4 bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-yellow-50/90 backdrop-blur-sm border border-amber-200 rounded-lg px-6 py-3 shadow-sm">
        <Shield className="w-5 h-5 text-red-500" />
        <span className="text-gray-700 font-medium">Forensic Investigation Center</span>
        <Badge variant="outline" className="border-green-300 text-green-600">
          Secure
        </Badge>
      </div>
    </motion.div>
  );
};