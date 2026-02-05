import { useState } from 'react';
import { Modal } from '@/components/Modal/Modal';
import styles from './RaffleBannerSection.module.scss';
import { useI18n } from '@/i18n';
import raffleBannerImg from '@/assets/icons/raffle-banner.png';

export const RaffleBannerSection = () => {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <button
        type="button"
        className={styles.banner}
        onClick={() => setOpen(true)}
        aria-label={t('raffleBanner.ariaOpen')}
      >
        <span className={styles.bg} aria-hidden="true" />
        <img
          className={styles.image}
          src={raffleBannerImg}
          alt={t('raffleBanner.alt')}
          draggable={false}
          loading="eager"
        />
      </button>

      <Modal
        isOpen={open}
        title={t('raffleModal.title')}
        button={t('common.gotIt')}
        onClose={() => setOpen(false)}
      >
        <div className={styles.modalBody}>
          <p className={styles.p}>{t('raffleModal.p1')}</p>

          <ul className={styles.ul}>
            <li>{t('raffleModal.b1')}</li>
            <li>{t('raffleModal.b2')}</li>
            <li>{t('raffleModal.b3')}</li>
          </ul>
          <p className={styles.p}>{t('raffleModal.p3')}</p>

          <p className={styles.p}>{t('raffleModal.p2')}</p>
        </div>
      </Modal>
    </>
  );
};