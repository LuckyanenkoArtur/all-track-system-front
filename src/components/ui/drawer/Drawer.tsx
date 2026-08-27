import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { FiMaximize2, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import Title from "../title/Title";
import styles from "./Drawer.module.scss";

type DrawerContextValue = {
  onClose: () => void;
  drawerRef: RefObject<HTMLElement | null>;
  titleId: string;
  expander?: string;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export const DrawerDismissContext = createContext<
  (() => void | false) | undefined
>(undefined);

export const DrawerDismissRegistryContext = createContext<
  RefObject<(() => void | false) | undefined> | undefined
>(undefined);

function useDrawerContext() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer subcomponents must be used inside Drawer");
  return ctx;
}

interface DrawerComponent extends FC<DrawerProps> {
  Header: FC<DrawerHeaderProps>;
  Title: FC<PropsWithChildren>;
  Desciption: FC<PropsWithChildren>;
  Content: FC<PropsWithChildren>;
}

type DrawerProps = PropsWithChildren & {
  open: boolean;
  expander?: string;
  unSaveConfirmation?: boolean;
};

type DrawerHeaderProps = PropsWithChildren;

export const Drawer: DrawerComponent = ({
  children,
  open: openProp,
  expander,
  unSaveConfirmation = false,
}) => {
  const [open, setOpen] = useState(openProp);

  const inheritedDismiss = useContext(DrawerDismissContext);
  const innerDismissRef = useRef<(() => void | false) | undefined>(undefined);
  const drawerRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    setOpen(openProp);
  }, [openProp]);

  const proceedClose = useCallback(() => {
    const dismiss = innerDismissRef.current ?? inheritedDismiss;
    if (dismiss?.() === false) return;
    setOpen(false);
  }, [inheritedDismiss]);

  const handleClose = useCallback(() => {
    const dismiss = innerDismissRef.current ?? inheritedDismiss;
    if (unSaveConfirmation) {
      dismiss?.();
      return;
    }
    proceedClose();
  }, [unSaveConfirmation, inheritedDismiss, proceedClose]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    const content = document.querySelector<HTMLElement>(".content");
    const previousBodyOverflow = document.body.style.overflow;
    const previousContentOverflow = content?.style.overflow ?? "";

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    if (content) content.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousBodyOverflow;
      if (content) content.style.overflow = previousContentOverflow;
    };
  }, [open, handleClose]);

  useEffect(() => {
    if (!open) return;
    drawerRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return createPortal(
    <DrawerDismissRegistryContext.Provider value={innerDismissRef}>
      <DrawerContext.Provider
        value={{ onClose: handleClose, drawerRef, titleId, expander }}
      >
        <div className={styles.overlay} role="presentation" onClick={handleClose}>
          <aside
            ref={drawerRef}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </aside>
        </div>
      </DrawerContext.Provider>
    </DrawerDismissRegistryContext.Provider>,
    document.body,
  );
};

Drawer.Header = ({ children }) => {
  const { onClose, expander } = useDrawerContext();
  const navigate = useNavigate();

  const handleExpand = () => {
    if (!expander) return;

    onClose();
    navigate(expander);
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerText}>{children}</div>
      <div className={styles.headerActions}>
        {expander ? (
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleExpand}
            aria-label="Expand"
          >
            <FiMaximize2 size={18} aria-hidden />
          </button>
        ) : null}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={onClose}
          aria-label="Close"
        >
          <FiX size={18} aria-hidden />
        </button>
      </div>
    </header>
  );
};

Drawer.Title = ({ children }) => {
  const { titleId } = useDrawerContext();
  const text = typeof children === "string" ? children : "";

  return (
    <Title as="h2" id={titleId} text={text} className={styles.headerTitle} />
  );
};

Drawer.Desciption = ({ children }) => {
  return <p className={styles.headerSubtitle}>{children}</p>;
};

Drawer.Content = ({ children }) => {
  return <div className={styles.body}>{children}</div>;
};
