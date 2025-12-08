import React from 'react';
import { Page } from '@/components/Page';
import styles from './UserAgreement.module.scss';
import { USER_AGREEMENT_HTML } from '@/content/userAgreement';

export const UserAgreement: React.FC = () => {
  return (
    <Page back={true}>
      <div className={styles.agreementPage} role="article" aria-labelledby="agreement-title">
        <div className={styles.container}>
          <h1 id="agreement-title" className={styles.title}>User Agreement</h1>
          <div className={styles.meta}>Last updated: 04.12.2025</div>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: USER_AGREEMENT_HTML }}
          />
        </div>
      </div>
    </Page>
  );
};
export default UserAgreement;