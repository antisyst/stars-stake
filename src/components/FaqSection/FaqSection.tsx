import { useMemo, useState, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowRightIcon from '@/assets/icons/arrow-right.svg?react';
import { Modal } from '@/components/Modal/Modal';
import { faqs } from '@/data/faqs';
import { FaqSectionProps } from '@/types';
import styles from './FaqSection.module.scss';

export const FaqSection: React.FC<FaqSectionProps> = ({
  variant = 'home',
  homeCount = 3,
  title = 'FAQ',
}) => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visibleIndices = useMemo(() => {
    if (variant === 'full') return faqs.map((_, i) => i);
    const count = Math.min(homeCount, faqs.length);
    return Array.from({ length: count }, (_, i) => i);
  }, [variant, homeCount]);

  const isModalOpen = openIndex !== null;
  const modalTitle = useMemo(
    () => (openIndex !== null ? faqs[openIndex].question : ''),
    [openIndex]
  );
  const modalContent = useMemo(
    () => (openIndex !== null ? faqs[openIndex].answer : ''),
    [openIndex]
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
        <h2 className="section-title">{title}</h2>

        <div className={styles.faqSectionContainer}>
          {visibleIndices.map((realIndex) => {
            const item = faqs[realIndex];
            return (
              <div
                key={item.question}
                className={styles.faqItem}
                role="button"
                tabIndex={0}
                onClick={() => openFaq(realIndex)}
                onKeyDown={(e) => onKey(e, realIndex)}
                aria-label={`${item.question} — read answer`}
              >
                <div className={styles.faqLabel}>{item.question}</div>
                <div className={styles.arrowWrapper}>
                  <ArrowRightIcon className="arrow-icon" />
                </div>
              </div>
            );
          })}

          {variant === 'home' && faqs.length > visibleIndices.length && (
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
              aria-label="Learn more — open full FAQ"
            >
              <div className={styles.faqLabel}>Learn more</div>
            </div>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        title={modalTitle}
        button="Got it"
        content={modalContent}
        onClose={closeFaq}
      />
    </>
  );
};