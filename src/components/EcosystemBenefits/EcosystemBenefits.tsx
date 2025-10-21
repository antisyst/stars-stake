import { useState, useMemo, KeyboardEvent } from 'react';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { Modal } from '@/components/Modal/Modal';
import { ecosystemBenefits } from '@/data/ecosystemBenefits';
import styles from './EcosystemBenefits.module.scss';

export const EcosystemBenefits = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const isModalOpen = openIndex !== null;
  const modalTitle = useMemo(
    () => (openIndex !== null ? ecosystemBenefits[openIndex].title : ''),
    [openIndex]
  );
  const modalContent = useMemo(
    () => (openIndex !== null ? ecosystemBenefits[openIndex].content : ''),
    [openIndex]
  );

  const handleOpen = (index: number) => setOpenIndex(index);
  const handleClose = () => setOpenIndex(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleOpen(index);
    }
  };

  return (
    <>
      <div className={styles.ecosystemBenefits}>
        <h2 className="section-title">Ecosystem Benefits</h2>
        <div className={styles.ecosystemContainer}>
          {ecosystemBenefits.map(({ title, Icon }, index) => (
            <div
              key={index}
              className={styles.containerItem}
              role="button"
              tabIndex={0}
              onClick={() => handleOpen(index)}
              onKeyDown={(e) => onKey(e, index)}
              aria-label={`${title} — more info`}
            >
              <div className={styles.icon}>
                <Icon />
              </div>
              <div className={styles.title}>{title}</div>
              <div className={styles.arrowWrapper}>
                <ArrowRightIcon className="arrow-icon" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        button="Got it"
        content={modalContent}
        onClose={handleClose}
      />
    </>
  );
};