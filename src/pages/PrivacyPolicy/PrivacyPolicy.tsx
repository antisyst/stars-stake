import React from 'react';
import { Page } from '@/components/Page';
import styles from './PrivacyPolicy.module.scss';
import { PRIVACY_POLICY_HTML } from '@/content/privacyPolicy';

export const PrivacyPolicy: React.FC = () => {
  return (
    <Page back={true}>
      <div className={styles.privacyPage} role="article" aria-labelledby="privacy-title">
        <div className={styles.container}>
          <h1 id="privacy-title" className={styles.title}>Privacy Policy</h1>
          <div className={styles.meta}>Last updated: 02.12.2025</div>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }}
          />
        </div>
      </div>
    </Page>
  );
};
export default PrivacyPolicy;