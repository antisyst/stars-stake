import React from 'react';
import styles from './Table.module.scss';

export interface TableRow {
  label: string;
  value?: React.ReactNode;
}

export interface TableProps {
  rows: TableRow[];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ rows, className }) => (
  <table className={`${[styles.table, className].filter(Boolean).join(' ')} glass-card`}>
    <tbody>
      {rows.map(({ label, value }, i) => (
        <tr
          key={i}
          className={[styles.row, value === undefined && styles.fullLabelRow]
            .filter(Boolean)
            .join(' ')}
        >
          {value !== undefined ? (
            <>
              <td className={styles.label}>{label}</td>
              <td className={styles.value}>{value}</td>
            </>
          ) : (
            <td className={styles.fullLabel} colSpan={2}>
              {label}
            </td>
          )}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;