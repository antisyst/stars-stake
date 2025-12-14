import { useState, useMemo, KeyboardEvent } from 'react';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { Modal } from '@/components/Modal/Modal';
import { ecosystemBenefits } from '@/data/ecosystemBenefits';
import styles from './EcosystemBenefits.module.scss';
import { useI18n } from '@/i18n';

export const EcosystemBenefits = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  const isModalOpen = openIndex !== null;
  const modalTitle = useMemo(() => {
    if (openIndex === null) return '';
    const key = ecosystemBenefits[openIndex].key;
    return t(`${key}.title`);
  }, [openIndex, t]);

  const modalContent = useMemo(() => {
    if (openIndex === null) return '';
    const key = ecosystemBenefits[openIndex].key;
    return t(`${key}.content`);
  }, [openIndex, t]);

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
        <h2 className="section-title">{t('ecosystem.title')}</h2>
        <div className={styles.ecosystemContainer}>
          {ecosystemBenefits.map(({ key, Icon }, index) => (
            <div
              key={key}
              className={styles.containerItem}
              role="button"
              tabIndex={0}
              onClick={() => handleOpen(index)}
              onKeyDown={(e) => onKey(e, index)}
              aria-label={`${t(`${key}.title`)} — more info`}
            >
              <div className={styles.icon}>
                <Icon />
              </div>
              <div className={styles.title}>{t(`${key}.title`)}</div>
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
        button={t('common.gotIt')}
        content={modalContent}
        onClose={handleClose}
      />
    </>
  );
};