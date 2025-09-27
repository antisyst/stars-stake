import { FC } from "react";
import styles from "./Spinner.module.scss";
import type { SpinnerProps } from "@/types";

export const Spinner: FC<SpinnerProps> = ({ size = 16 }) => (
  <div className={styles.spinnerContainer}>
    <div
      className={styles.spinner}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  </div>
);