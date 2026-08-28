import type {
  FC,
  HTMLAttributes,
  PropsWithChildren,
  TimeHTMLAttributes,
} from "react";

import styles from "./FeedItem.module.scss";

type FeedItemRootProps = PropsWithChildren<{
  className?: string;
}>;

type FeedItemPartProps = PropsWithChildren<{
  className?: string;
}>;

type FeedItemBadgeProps = PropsWithChildren<{
  variant?: "accent" | "muted";
  className?: string;
}>;

type FeedItemTimeProps = PropsWithChildren<
  TimeHTMLAttributes<HTMLTimeElement> & {
    className?: string;
  }
>;

type FeedItemAvatarProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    className?: string;
  }
>;

interface FeedItemComponent extends FC<FeedItemRootProps> {
  Avatar: FC<FeedItemAvatarProps>;
  Body: FC<FeedItemPartProps>;
  Header: FC<FeedItemPartProps>;
  Meta: FC<FeedItemPartProps>;
  Author: FC<FeedItemPartProps>;
  Badge: FC<FeedItemBadgeProps>;
  Time: FC<FeedItemTimeProps>;
  Title: FC<FeedItemPartProps>;
  Content: FC<FeedItemPartProps>;
}

const badgeVariantClassName = {
  accent: styles.badgeAccent,
  muted: styles.badgeMuted,
} as const;

export const FeedItem: FeedItemComponent = ({ children, className = "" }) => (
  <div className={`${styles.root} ${className}`.trim()}>{children}</div>
);

FeedItem.Avatar = ({ children, className = "", ...props }) => (
  <div
    className={`${styles.avatar} ${className}`.trim()}
    aria-hidden
    {...props}
  >
    {children}
  </div>
);

FeedItem.Body = ({ children, className = "" }) => (
  <div className={`${styles.body} ${className}`.trim()}>{children}</div>
);

FeedItem.Header = ({ children, className = "" }) => (
  <div className={`${styles.header} ${className}`.trim()}>{children}</div>
);

FeedItem.Meta = ({ children, className = "" }) => (
  <div className={`${styles.meta} ${className}`.trim()}>{children}</div>
);

FeedItem.Author = ({ children, className = "" }) => (
  <strong className={`${styles.author} ${className}`.trim()}>
    {children}
  </strong>
);

FeedItem.Badge = ({ children, variant = "muted", className = "" }) => (
  <span
    className={`${styles.badge} ${badgeVariantClassName[variant]} ${className}`.trim()}
  >
    {children}
  </span>
);

FeedItem.Time = ({ children, className = "", ...props }) => (
  <time className={`${styles.time} ${className}`.trim()} {...props}>
    {children}
  </time>
);

FeedItem.Title = ({ children, className = "" }) => (
  <p className={`${styles.title} ${className}`.trim()}>{children}</p>
);

FeedItem.Content = ({ children, className = "" }) => (
  <div className={`${styles.content} ${className}`.trim()}>{children}</div>
);
