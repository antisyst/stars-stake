import React from 'react';
import { Page } from '@/components/Page';
import styles from './LanguagePage.module.scss';
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker';
import { useI18n } from '@/i18n';

export const LanguagePage: React.FC = () => {
  const { t } = useI18n();

  return (
    <Page back={true}>
      <div className={styles.languagePage}>
        <h2 className="language-section-title">{t('profile.language')}</h2>
        <div className={styles.content}>
          <LanguagePicker />
        </div>
      </div>
    </Page>
  );
};