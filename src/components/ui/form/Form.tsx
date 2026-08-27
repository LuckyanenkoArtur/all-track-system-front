import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type FC,
  type FormEvent,
  type MouseEvent,
  type PropsWithChildren,
  type ReactNode,
} from "react";

import { ConfirmDialog } from "../../../features/user-profile/components/dialogs/Dialog";
import {
  DrawerDismissContext,
  DrawerDismissRegistryContext,
} from "../drawer/Drawer";
import buttonStyles from "../button/Button.module.scss";
import styles from "./Form.module.scss";
import { useTranslation } from "../../../i18n";

export type FormDismissHandlers = {
  requestClose: () => void;
  confirmOpen: boolean;
};

export type FormUnsavedConfirmationVariant =
  | "budgetExpense"
  | "completeTask"
  | "dashboard"
  | "taskCreation";

type FormContextValue = {
  formId?: string;
  registerFormId: (formId?: string) => void;
  registerSubmitHandler: (
    handler?: (event: FormEvent<HTMLFormElement>) => void,
  ) => void;
  handleFormSubmit: (event: FormEvent<HTMLFormElement>) => void;
  requestClose: () => void;
  confirmOpen: boolean;
};

const FormContext = createContext<FormContextValue | null>(null);

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Form subcomponents must be used inside Form");
  }
  return context;
}

export function useFormDismiss(): FormDismissHandlers {
  const { requestClose, confirmOpen } = useFormContext();
  return { requestClose, confirmOpen };
}

type FormRootProps = PropsWithChildren<{
  isDirty?: () => boolean;
  unsavedConfirmation?: boolean | FormUnsavedConfirmationVariant;
  onClose: () => void;
  resetKey?: unknown;
}>;

type FormBodyProps = PropsWithChildren<{
  as?: "form" | "div";
  id?: string;
  className?: string;
  contentGap?: "default" | "compact";
}>;

type FormDrawerDismissProps = PropsWithChildren<{
  beforeDismiss?: () => void | false;
}>;

export type FormButtonProps = {
  children: ReactNode;
  type?: "submit" | "button";
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  cancel?: boolean;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  form?: string;
  className?: string;
} & Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "disabled" | "onClick" | "children" | "form"
>;

interface FormComponent extends FC<FormRootProps> {
  Body: FC<FormBodyProps>;
  Footer: FC<PropsWithChildren<{ className?: string }>>;
  Button: FC<FormButtonProps>;
  DrawerDismiss: FC<FormDrawerDismissProps>;
}

export const Form: FormComponent = ({
  children,
  isDirty,
  unsavedConfirmation,
  onClose,
  resetKey,
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formId, setFormId] = useState<string | undefined>();
  const submitHandlerRef = useRef<
    ((event: FormEvent<HTMLFormElement>) => void) | undefined
  >(undefined);
  const { t } = useTranslation();

  const dirty = isDirty?.() ?? false;
  const hasUnsavedConfirmation = Boolean(unsavedConfirmation);

  const registerFormId = useCallback((nextFormId?: string) => {
    setFormId(nextFormId);
  }, []);

  const registerSubmitHandler = useCallback(
    (handler?: (event: FormEvent<HTMLFormElement>) => void) => {
      submitHandlerRef.current = handler;
    },
    [],
  );

  const handleFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitHandlerRef.current?.(event);
  }, []);

  useEffect(() => {
    setConfirmOpen(false);
  }, [resetKey]);

  const requestClose = useCallback(() => {
    if (hasUnsavedConfirmation && dirty) {
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(false);
    onClose();
  }, [hasUnsavedConfirmation, dirty, onClose]);

  const handleConfirmDiscard = useCallback(() => {
    setConfirmOpen(false);
    onClose();
  }, [onClose]);

  const unsavedVariant: FormUnsavedConfirmationVariant =
    typeof unsavedConfirmation === "string"
      ? unsavedConfirmation
      : "budgetExpense";

  const unsavedLabels = {
    budgetExpense: {
      title: t.tasks.details.budgetExpenseUnsavedTitle,
      message: t.tasks.details.budgetExpenseUnsavedMessage,
      confirmLabel: t.tasks.details.budgetExpenseUnsavedYes,
      cancelLabel: t.tasks.details.budgetExpenseUnsavedNo,
    },
    completeTask: {
      title: t.tasks.details.completeUnsavedTitle,
      message: t.tasks.details.completeUnsavedMessage,
      confirmLabel: t.tasks.details.completeUnsavedYes,
      cancelLabel: t.tasks.details.completeUnsavedNo,
    },
    dashboard: {
      title: t.tasks.dashboard.unsavedTitle,
      message: t.tasks.dashboard.unsavedMessage,
      confirmLabel: t.tasks.dashboard.unsavedYes,
      cancelLabel: t.tasks.dashboard.unsavedNo,
    },
    taskCreation: {
      title: t.tasks.dashboard.unsavedTitle,
      message: t.tasks.dashboard.unsavedMessage,
      confirmLabel: t.tasks.dashboard.unsavedYes,
      cancelLabel: t.tasks.dashboard.unsavedNo,
    },
  }[unsavedVariant];

  return (
    <FormContext.Provider
      value={{
        formId,
        registerFormId,
        registerSubmitHandler,
        handleFormSubmit,
        requestClose,
        confirmOpen,
      }}
    >
      {children}

      {hasUnsavedConfirmation ? (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmDiscard}
          title={unsavedLabels.title}
          message={unsavedLabels.message}
          confirmLabel={unsavedLabels.confirmLabel}
          cancelLabel={unsavedLabels.cancelLabel}
        />
      ) : null}
    </FormContext.Provider>
  );
};

Form.DrawerDismiss = ({ children, beforeDismiss }) => {
  const { requestClose, confirmOpen } = useFormContext();
  const dismissRegistry = useContext(DrawerDismissRegistryContext);

  const handleDismiss = useCallback(() => {
    if (confirmOpen) return false;
    if (beforeDismiss?.() === false) return false;
    requestClose();
  }, [beforeDismiss, confirmOpen, requestClose]);

  useLayoutEffect(() => {
    if (!dismissRegistry) return;
    dismissRegistry.current = handleDismiss;
    return () => {
      if (dismissRegistry.current === handleDismiss) {
        dismissRegistry.current = undefined;
      }
    };
  }, [dismissRegistry, handleDismiss]);

  return (
    <DrawerDismissContext.Provider value={handleDismiss}>
      {children}
    </DrawerDismissContext.Provider>
  );
};

Form.Body = ({
  children,
  as = "form",
  id,
  className = "",
  contentGap = "default",
}) => {
  const { registerFormId, handleFormSubmit } = useFormContext();
  const gapClass =
    contentGap === "compact"
      ? styles.contentGapCompact
      : styles.contentGapDefault;
  const bodyClassName = `${styles.content} ${gapClass} ${className}`.trim();

  useEffect(() => {
    if (as !== "form") return;
    registerFormId(id);
    return () => registerFormId(undefined);
  }, [as, id, registerFormId]);

  if (as === "div") {
    return <div className={bodyClassName}>{children}</div>;
  }

  return (
    <form id={id} className={bodyClassName} onSubmit={handleFormSubmit}>
      {children}
    </form>
  );
};

Form.Footer = ({ children, className = "" }) => (
  <footer className={`${styles.footer} ${className}`.trim()}>{children}</footer>
);

const variantClassName = {
  primary: "",
  secondary: buttonStyles.secondary,
  ghost: buttonStyles.ghost,
} as const;

Form.Button = ({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  cancel = false,
  onClick,
  onSubmit,
  form,
  className = "",
  ...props
}) => {
  const { formId, registerSubmitHandler, requestClose } = useFormContext();

  useEffect(() => {
    if (!onSubmit) return;
    registerSubmitHandler(onSubmit);
    return () => registerSubmitHandler(undefined);
  }, [onSubmit, registerSubmitHandler]);

  const getFormElement = () => {
    const targetFormId = form ?? formId;
    if (!targetFormId) return null;

    const element = document.getElementById(targetFormId);
    return element instanceof HTMLFormElement ? element : null;
  };

  const runSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    if (!onSubmit) return;

    const formElement = getFormElement();
    if (formElement && !formElement.reportValidity()) return;

    onSubmit(event as unknown as FormEvent<HTMLFormElement>);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (cancel) {
      event.preventDefault();
      requestClose();
      return;
    }

    if (onSubmit) {
      event.preventDefault();
      runSubmit(event);
    }

    onClick?.(event);
  };

  return (
    <button
      type={type}
      form={type === "submit" ? (form ?? formId) : form}
      disabled={disabled}
      onClick={handleClick}
      className={`${buttonStyles.root} ${variantClassName[variant]} ${styles.footerButton} ${className}`.trim()}
      {...props}
    >
      <span className={buttonStyles.copy}>
        <strong>{children}</strong>
      </span>
    </button>
  );
};
