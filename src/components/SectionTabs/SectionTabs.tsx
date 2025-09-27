import React from 'react';
import styles from './SectionTabs.module.scss';

interface Tab {
  id: string;
  label: string;
}

interface SectionTabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  tabs,
  activeTab,
  onChange
}) => (
  <div className={styles.sectionTabs}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);