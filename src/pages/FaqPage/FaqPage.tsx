import { Page } from '@/components/Page';
import HelpIcon from '@/assets/icons/help.svg?react';
import { FaqSection } from '@/components/FaqSection/FaqSection';
import { motion } from 'framer-motion';
import styles from './FaqPage.module.scss';

export const FaqPage = () => {
  return (
    <Page back>
      <div className={styles.faqPage}>
        <motion.div
          className={styles.iconWrapper}
          initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 90,
            damping: 12,
            duration: 0.6,
          }}
        >
          <HelpIcon className="icon" />
        </motion.div>

        <FaqSection variant="full" title="Frequently Asked Questions" />
      </div>
    </Page>
  );
};