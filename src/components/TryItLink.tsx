import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type { ReactNode } from 'react';
import styles from './TryItLink.module.css';

/**
 * Deep-link from a docs API page to the corresponding sdk-example page.
 *
 * Contract (see CLAUDE.md → "sdk-example deep-link 컨벤션"):
 * - `group`  matches the sdk-example route segment, e.g. "clipboard"
 * - `method` matches the SDK export name, e.g. "setClipboardText"
 * - Resulting URL: https://apps-in-toss-community.github.io/sdk-example/<group>#<method>
 *
 * The #<method> anchor is future-proofing: sdk-example does not honor anchors
 * yet, but the contract is fixed now so the links don't need to change later.
 */
export interface TryItLinkProps {
  group: string;
  method: string;
  children?: ReactNode;
}

const SDK_EXAMPLE_BASE = 'https://apps-in-toss-community.github.io/sdk-example';

export default function TryItLink({ group, method, children }: TryItLinkProps): ReactNode {
  const { i18n } = useDocusaurusContext();
  const isKorean = i18n.currentLocale === 'ko';
  const defaultLabel = isKorean ? 'sdk-example에서 실행해 보기' : 'Open in sdk-example';
  const href = `${SDK_EXAMPLE_BASE}/${group}#${method}`;
  return (
    <a
      className={styles.tryItLink}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      data-group={group}
      data-method={method}
    >
      <span aria-hidden="true" className={styles.arrow}>
        →
      </span>
      <span>{children ?? defaultLabel}</span>
    </a>
  );
}
