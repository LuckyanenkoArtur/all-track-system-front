import type { FC, HTMLAttributes, PropsWithChildren } from "react";

import styles from "./Card.module.scss";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

interface CardComponent extends FC<CardProps> {
  Title: FC<CardProps>;
  Content: FC<CardProps>;
}

export const Card: CardComponent = ({ children, className = "", ...props }) => (
  <div className={`${styles.root} ${className}`.trim()} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = "", ...props }) => (
  <div className={`${styles.title} ${className}`.trim()} {...props}>
    {children}
  </div>
);

Card.Content = ({ children, className = "", ...props }) => (
  <div className={`${styles.content} ${className}`.trim()} {...props}>
    {children}
  </div>
);
