import { useRef, useEffect } from 'react';
import ArrowIcon from '@/assets/dropdown-active.svg';
import SelectedIcon from '@/assets/selected.svg';
import styles from './Dropdown.module.scss';

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

export interface DropdownProps<T extends string> {
  label: string;
  options: DropdownOption<T>[];
  selectedValue: T;
  onSelect: (value: T) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  icon?: string;
  openIcon?: string;
  activeIconMap?: Partial<Record<T, string>>;
  className?: string;
  hideCurrent?: boolean;
}

export function Dropdown<T extends string>({
  label,
  options,
  selectedValue,
  onSelect,
  isOpen,
  onToggle,
  onClose,
  icon,
  openIcon,
  activeIconMap,
  className = '',
  hideCurrent = false,
}: DropdownProps<T>) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = () => {
    if (isOpen && openIcon) return openIcon;
    if (activeIconMap && activeIconMap[selectedValue]) {
      return activeIconMap[selectedValue]!;
    }
    return icon;
  };
  const iconSrc = getIcon();

  return (
    <div className={`${styles.dropdown} ${className}`} ref={ref}>
      <button
        type="button"
        className={`${styles.toggle} ${isOpen ? styles.open : ''}`}
        onClick={onToggle}
      >
        {iconSrc && (
          <img src={iconSrc} alt="" className={styles.icon} />
        )}
        <span className={styles.label}>{label}</span>
        {!hideCurrent && (
          <span className={styles.current}>
            {options.find((o) => o.value === selectedValue)?.label}
          </span>
        )}
         <img src={ArrowIcon} alt="Arrow" className={styles.arrowIcon} />
      </button>
      {isOpen && (
        <ul className={styles.menu}>
          {options.map((opt) => (
            <li
              key={opt.value}
              className={`${styles.item} ${
                opt.value === selectedValue ? styles.selected : ''
              }`}
              onClick={() => {
                onSelect(opt.value);
                onClose();
              }}
            >
              <span>{opt.label}</span>
              {opt.value === selectedValue && (
               <img src={SelectedIcon} alt="Selected" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}