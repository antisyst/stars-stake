import React, { useEffect, useMemo, useRef, useState } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import * as pako from 'pako';
import clsx from 'clsx';
import styles from './EmptySection.module.scss';

type Props = {
  icon: string | React.ReactNode;
  title: string;
  subtitle?: string;
  className?: string;
  iconSize?: number;
  loop?: boolean;
  autoplay?: boolean;
};

const isString = (v: unknown): v is string => typeof v === 'string';

export const EmptySection: React.FC<Props> = ({
  icon,
  title,
  subtitle,
  className,
  iconSize = 110,
  loop = true,
  autoplay = true,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ext = useMemo(() => (isString(icon) ? icon.split('?')[0].split('.').pop()?.toLowerCase() : undefined), [icon]);

  useEffect(() => {
    let anim: AnimationItem | null = null;
    let cancelled = false;

    async function loadTgs(url: string) {
      if (!containerRef.current) return;
      try {
        const res = await fetch(url, { cache: 'force-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        const jsonStr = pako.ungzip(new Uint8Array(buf), { to: 'string' }) as string;
        if (cancelled) return;

        const animationData = JSON.parse(jsonStr);
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop,
          autoplay,
          animationData,
        });
      } catch (e) {
        setError('Failed to load animation.');
      }
    }

    if (isString(icon) && ext === 'tgs') {
      if (containerRef.current) containerRef.current.innerHTML = '';
      loadTgs(icon);
    }

    return () => {
      cancelled = true;
      if (anim) {
        anim.destroy();
        anim = null;
      }
    };
  }, [icon, ext, loop, autoplay]);

  const renderIcon = () => {
    if (!isString(icon)) {
      return <div className={styles.iconNode} style={{ width: iconSize, height: iconSize }}>{icon}</div>;
    }
    if (ext === 'tgs') {
      return <div ref={containerRef} className={styles.lottie} style={{ width: iconSize, height: iconSize }} aria-hidden="true" />;
    }
    return (
      <img
        className={styles.img}
        src={icon}
        alt=""
        width={iconSize}
        height={iconSize}
        draggable={false}
      />
    );
  };

  return (
    <div className={`${clsx(styles.emptySection, className)} glass-card`}>
      <div className={styles.iconWrap}>{renderIcon()}</div>
      <div className={styles.title} role="heading" aria-level={2}>{title}</div>
      {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      {error ? <div className={styles.error} aria-live="polite">{error}</div> : null}
    </div>
  );
};

export default EmptySection;