import { useMemo, useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { Modal } from '@/components/Modal/Modal';
import { faqKeys } from '@/data/faqs';
import { FaqSectionProps } from '@/types';
import styles from './FaqSection.module.scss';
import { useI18n } from '@/i18n';

export const FaqSection: React.FC<FaqSectionProps> = ({
  variant = 'home',
  homeCount = 3,
  title,
}) => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { t } = useI18n();

  const resolvedTitle = title ?? t('faqs.pageTitle');

  const visibleIndices = useMemo(() => {
    if (variant === 'full') return faqKeys.map((_, i) => i);
    const count = Math.min(homeCount, faqKeys.length);
    return Array.from({ length: count }, (_, i) => i);
  }, [variant, homeCount]);

  const isModalOpen = openIndex !== null;
  const modalTitle = useMemo(
    () => (openIndex !== null ? t(`${faqKeys[openIndex]}.question`) : ''),
    [openIndex, t]
  );
  const modalContent = useMemo(
    () => (openIndex !== null ? t(`${faqKeys[openIndex]}.answer`) : ''),
    [openIndex, t]
  );

  const openFaq = (index: number) => setOpenIndex(index);
  const closeFaq = () => setOpenIndex(null);

  const onKey = (e: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFaq(index);
    }
  };

  const goLearnMore = () => navigate('/faq', { replace: false });

  return (
    <>
      <div className={styles.faqSection}>
        <h2 className="section-title">{resolvedTitle}</h2>

        <div className={`${styles.faqSectionContainer} glass-card`}>
          {visibleIndices.map((realIndex) => {
            const key = faqKeys[realIndex];
            const question = t(`${key}.question`);
            return (
              <div
                key={key}
                className={styles.faqItem}
                role="button"
                tabIndex={0}
                onClick={() => openFaq(realIndex)}
                onKeyDown={(e) => onKey(e, realIndex)}
                aria-label={`${question} — ${t('faqs.learnMore')}`}
              >
                <div className={styles.faqLabel}>{question}</div>
                <div className={styles.arrowWrapper}>
                  <ArrowRightIcon className="arrow-icon" />
                </div>
              </div>
            );
          })}

          {variant === 'home' && faqKeys.length > visibleIndices.length && (
            <div
              className={styles.learnMore}
              role="button"
              tabIndex={0}
              onClick={goLearnMore}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goLearnMore();
                }
              }}
              aria-label={`${t('faqs.learnMore')} — open full FAQ`}
            >
              <div className={styles.faqLabel}>{t('faqs.learnMore')}</div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        button={t('common.gotIt')}
        content={modalContent}
        onClose={closeFaq}
      />
    </>
  );
};