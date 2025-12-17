import { motion } from 'framer-motion';
import StarIcon from '@/assets/icons/star.svg?react';
import styles from './LoaderScreen.module.scss';

export const LoaderScreen = () => {
  return (
    <div className={styles.loaderScreen}>
      <motion.div
        className={`${styles.iconWrapper} gradient-move`}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { 
            scale: 0.5,
            opacity: 0, 
            filter: 'blur(15px)',
            y: 30
          },
          visible: { 
            scale: 1, 
            opacity: 1, 
            filter: 'blur(0px)',
            y: 0,
            transition: {
              filter: { duration: 0.3, ease: "easeOut" },
              opacity: { duration: 0.2, ease: "linear" },
              
              scale: { type: "spring", stiffness: 380, damping: 28, mass: 1 },
              y: { type: "spring", stiffness: 380, damping: 28, mass: 1 },
              
              delayChildren: 0.15 
            }
          }
        }}
      >
        <motion.div
          variants={{
            hidden: { 
              scale: 0, 
              rotate: -45,
              opacity: 0 
            },
            visible: { 
              scale: 1, 
              rotate: 0, 
              opacity: 1,
              transition: {
                type: "spring" as const, 
                stiffness: 250,
                damping: 18 
              }
            }
          }}
          style={{ display: 'flex' }} 
        >
          <StarIcon />
        </motion.div>
      </motion.div>
    </div>
  );
}