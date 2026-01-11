import React from 'react';
import styles from './LinkList.module.scss';
import { useNavigate } from 'react-router-dom';

export type LinkListItem = {
  key: string;
  label: string;
  to: string;
  ariaLabel?: string;
};

type Props = {
  items: LinkListItem[];
  className?: string;
};

export const LinkList: React.FC<Props> = ({ items, className }) => {
  const navigate = useNavigate();

  const handleClick = (item: LinkListItem) => {
    navigate(item.to);
  };

  return (
    <div className={`${styles.linkList} glass-card ${className ?? ''}`}>
      {items.map((item) => (
        <div
          key={item.key}
          className={styles.row}
          role="link"
          tabIndex={0}
          aria-label={item.ariaLabel ?? item.label}
          onClick={() => handleClick(item)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick(item);
            }
          }}
        >
          <div className={styles.label}>{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default LinkList;