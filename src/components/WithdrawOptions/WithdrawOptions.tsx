import { useState } from 'react';
import styles from './WithdrawOptions.module.scss';
import TonIcon from '@/assets/icons/toncoin.svg?react';
import HelpIcon from '@/assets/icons/help.svg?react';
import StarIcon from '@/assets/icons/star-gradient.svg?react';
import { Modal } from '../Modal/Modal';

export const WithdrawOptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalContent = [
    'You can withdraw your rewards either directly in Telegram Stars or in Toncoin ( TON ) based on your preference.',
    'When withdrawing in TON, a small network fee of up to 1% may apply depending on the total amount.',
    'All withdrawals are processed securely and typically completed within minutes after confirmation.',
    'Before proceeding with a TON withdrawal, please ensure your TON wallet is connected.'
  ].join('\n');

  return (
    <>
     <div className={styles.withdrawOptions} onClick={() => setIsModalOpen(true)}>
        <h2 className="section-title">Withdraw Options</h2>
        <div className={styles.withdrawSection}>
            <div className={styles.item}>
                <StarIcon/>
                <div className={styles.title}>Telegram Stars</div>
            </div>
            <div className={styles.item}>
                <TonIcon/>
                <div className={styles.title}>Toncoin</div>
            </div>
            <div className={styles.helpWrapper}>
                <HelpIcon className='icon'/>
            </div>
        </div>
        <span className='subtitle'>When withdrawing in TON, a small network fee of up to 1% may apply, depending on the withdrawal amount.</span>
     </div>
     <Modal
        isOpen={isModalOpen}
        title="Withdraw Options"
        button="Got it"
        content={modalContent}
        onClose={() => setIsModalOpen(false)}
     />
    </>
  )
}