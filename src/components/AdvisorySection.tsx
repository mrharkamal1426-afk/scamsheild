import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertOctagon, Lightbulb, ArrowRight } from 'lucide-react';

interface AdvisorySectionProps {
  whatToDo: string[];
  howToStaySafe: string[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export const AdvisorySection: React.FC<AdvisorySectionProps> = React.memo(({ whatToDo, howToStaySafe }) => (
  <section className="mb-6 space-y-6" aria-labelledby="advisory-section-title" data-testid="advisory-section">
    {/* What To Do Next */}
    <div className="bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-800/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
          <AlertOctagon className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <h4 className="font-semibold text-red-900 dark:text-red-300">
          Immediate Actions Required
        </h4>
      </div>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-2"
      >
        {whatToDo.map((action, idx) => (
          <motion.li
            key={idx}
            variants={item}
            className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200"
          >
            <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{action}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>

    {/* How To Stay Safe */}
    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-800/30 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <h4 className="font-semibold text-blue-900 dark:text-blue-300">
          Prevention Tips
        </h4>
      </div>
      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {howToStaySafe.map((tip, idx) => (
          <motion.li
            key={idx}
            variants={item}
            className="flex items-start gap-2"
          >
            <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg mt-0.5">
              <Lightbulb className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">{tip}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  </section>
));
AdvisorySection.displayName = 'AdvisorySection'; 