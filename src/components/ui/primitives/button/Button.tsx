import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FC,
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import styles from "./Button.module.scss";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type ButtonProps = PropsWithChildren<{
  onClick: () => void;
  className?: string;
  active?: boolean;
  ariaExpanded?: boolean;
  ariaHasPopup?: boolean | "false" | "true" | "menu" | "listbox" | "tree" | "grid" | "dialog";
  ariaControls?: string;
  ariaLabel?: string;
  disabled?: boolean;
}>;

type ButtonTooltipSlotProps = PropsWithChildren<{
  position?: TooltipPosition;
}>;

interface ButtonComponent extends FC<ButtonProps> {
  Icon: FC<PropsWithChildren>;
  Text: FC<PropsWithChildren>;
  Tooltip: FC<ButtonTooltipSlotProps>;
  Badge: FC<PropsWithChildren>;
}

const TOOLTIP_VIEWPORT_PADDING = 8;
const TOOLTIP_OFFSET = 10;
const TOOLTIP_SHOW_DELAY_MS = 350;

type TooltipCoords = {
  top: number;
  left: number;
  placement: TooltipPosition;
};

const TOOLTIP_FLIP_ORDER: Record<TooltipPosition, TooltipPosition[]> = {
  top: ["bottom", "right", "left"],
  bottom: ["top", "right", "left"],
  left: ["right", "bottom", "top"],
  right: ["left", "bottom", "top"],
};

function getTooltipText(children: ReactNode): string {
  if (children == null || typeof children === "boolean") {
    return "";
  }

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map(getTooltipText).join("").trim();
  }

  return "";
}

function shouldShowBadge(value: ReactNode): boolean {
  if (value == null || value === false) {
    return false;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return false;
    }

    const count = Number(trimmed);
    return !Number.isNaN(count) && count > 0;
  }

  return false;
}

function getChildByDisplayName(children: ReactNode, displayName: string) {
  const match = Children.toArray(children).find(
    (child) =>
      isValidElement(child) &&
      typeof child.type === "function" &&
      "displayName" in child.type &&
      child.type.displayName === displayName,
  );

  return isValidElement(match) ? match : undefined;
}

function getTooltipViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function getTooltipCoordsForPlacement(
  placement: TooltipPosition,
  anchorRect: DOMRect,
  tooltipRect: DOMRect,
  offset: number,
): Pick<TooltipCoords, "top" | "left"> {
  switch (placement) {
    case "top":
      return {
        top: anchorRect.top - tooltipRect.height - offset,
        left: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
      };
    case "bottom":
      return {
        top: anchorRect.bottom + offset,
        left: anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2,
      };
    case "left":
      return {
        top: anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2,
        left: anchorRect.left - tooltipRect.width - offset,
      };
    case "right":
      return {
        top: anchorRect.top + anchorRect.height / 2 - tooltipRect.height / 2,
        left: anchorRect.right + offset,
      };
  }
}

function clampTooltipToViewport(
  top: number,
  left: number,
  tooltipRect: DOMRect,
  padding: number,
) {
  const { width: viewportWidth, height: viewportHeight } =
    getTooltipViewportSize();

  return {
    top: Math.min(
      Math.max(padding, top),
      viewportHeight - tooltipRect.height - padding,
    ),
    left: Math.min(
      Math.max(padding, left),
      viewportWidth - tooltipRect.width - padding,
    ),
  };
}

function tooltipFitsInViewport(
  top: number,
  left: number,
  tooltipRect: DOMRect,
  padding: number,
) {
  const { width: viewportWidth, height: viewportHeight } =
    getTooltipViewportSize();

  return (
    top >= padding &&
    left >= padding &&
    top + tooltipRect.height <= viewportHeight - padding &&
    left + tooltipRect.width <= viewportWidth - padding
  );
}

function resolveTooltipPosition({
  preferred,
  anchorRect,
  tooltipRect,
  viewportPadding = TOOLTIP_VIEWPORT_PADDING,
  offset = TOOLTIP_OFFSET,
}: {
  preferred: TooltipPosition;
  anchorRect: DOMRect;
  tooltipRect: DOMRect;
  viewportPadding?: number;
  offset?: number;
}): TooltipCoords {
  const candidates = [preferred, ...TOOLTIP_FLIP_ORDER[preferred]];

  for (const placement of candidates) {
    const coords = getTooltipCoordsForPlacement(
      placement,
      anchorRect,
      tooltipRect,
      offset,
    );

    if (
      tooltipFitsInViewport(coords.top, coords.left, tooltipRect, viewportPadding)
    ) {
      return { ...coords, placement };
    }
  }

  const fallbackCoords = getTooltipCoordsForPlacement(
    preferred,
    anchorRect,
    tooltipRect,
    offset,
  );
  const clamped = clampTooltipToViewport(
    fallbackCoords.top,
    fallbackCoords.left,
    tooltipRect,
    viewportPadding,
  );

  return {
    ...clamped,
    placement: preferred,
  };
}

function useButtonTooltipPosition({
  preferred,
  enabled,
}: {
  preferred: TooltipPosition;
  enabled: boolean;
}) {
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const showTimeoutRef = useRef<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [coords, setCoords] = useState<TooltipCoords>({
    top: 0,
    left: 0,
    placement: preferred,
  });

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    const tooltip = tooltipRef.current;
    if (!anchor || !tooltip) return;

    setCoords(
      resolveTooltipPosition({
        preferred,
        anchorRect: anchor.getBoundingClientRect(),
        tooltipRect: tooltip.getBoundingClientRect(),
      }),
    );
    setIsPositioned(true);
  }, [preferred]);

  const show = useCallback(() => {
    if (!enabled) return;

    window.clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, TOOLTIP_SHOW_DELAY_MS);
  }, [enabled]);

  const hide = useCallback(() => {
    window.clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
    setIsPositioned(false);
  }, []);

  useLayoutEffect(() => {
    if (!isVisible) return;
    updatePosition();
  }, [isVisible, updatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleViewportChange = () => updatePosition();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isVisible, updatePosition]);

  useEffect(
    () => () => {
      window.clearTimeout(showTimeoutRef.current);
    },
    [],
  );

  return {
    anchorRef,
    tooltipRef,
    isVisible,
    isPositioned,
    coords,
    show,
    hide,
  };
}

type ButtonTooltipOverlayProps = {
  text: string;
  position?: TooltipPosition;
  children: ReactElement<{ "aria-describedby"?: string }>;
  className?: string;
};

function ButtonTooltipOverlay({
  text,
  position = "top",
  children,
  className = "",
}: ButtonTooltipOverlayProps) {
  const tooltipId = useId();
  const isEnabled = text.trim().length > 0;
  const {
    anchorRef,
    tooltipRef,
    isVisible,
    isPositioned,
    coords,
    show,
    hide,
  } = useButtonTooltipPosition({ preferred: position, enabled: isEnabled });

  if (!isEnabled) {
    return children;
  }

  const existingDescribedBy = children.props["aria-describedby"];

  return (
    <>
      <span
        ref={anchorRef}
        className={`${styles.tooltipWrapper} ${className}`.trim()}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {cloneElement(children, {
          "aria-describedby": existingDescribedBy
            ? `${existingDescribedBy} ${tooltipId}`
            : tooltipId,
        })}
      </span>

      {isVisible &&
        createPortal(
          <span
            ref={tooltipRef}
            id={tooltipId}
            role="tooltip"
            style={{ top: coords.top, left: coords.left }}
            className={`${styles.tooltip} ${styles[coords.placement]} ${
              isPositioned ? styles.tooltipVisible : ""
            }`.trim()}
          >
            {text}
          </span>,
          document.body,
        )}
    </>
  );
}

const ButtonIcon: FC<PropsWithChildren> = () => null;
ButtonIcon.displayName = "ButtonIcon";

const ButtonText: FC<PropsWithChildren> = () => null;
ButtonText.displayName = "ButtonText";

const ButtonTooltip: FC<ButtonTooltipSlotProps> = () => null;
ButtonTooltip.displayName = "ButtonTooltip";

const ButtonBadge: FC<PropsWithChildren> = () => null;
ButtonBadge.displayName = "ButtonBadge";

export const Button: ButtonComponent = ({
  onClick,
  className = "",
  active = false,
  ariaExpanded,
  ariaHasPopup,
  ariaControls,
  ariaLabel,
  disabled = false,
  children,
}) => {
  const iconChild = getChildByDisplayName(children, "ButtonIcon");
  const textChild = getChildByDisplayName(children, "ButtonText");
  const tooltipChild = getChildByDisplayName(children, "ButtonTooltip");
  const badgeChild = getChildByDisplayName(children, "ButtonBadge");

  const icon = (iconChild?.props as PropsWithChildren | undefined)?.children ?? null;
  const text = (textChild?.props as PropsWithChildren | undefined)?.children ?? null;
  const badge = (badgeChild?.props as PropsWithChildren | undefined)?.children ?? null;
  const tooltipProps = tooltipChild?.props as ButtonTooltipSlotProps | undefined;
  const tooltipText = tooltipProps?.children
    ? getTooltipText(tooltipProps.children)
    : "";
  const tooltipPosition = tooltipProps?.position ?? "bottom";

  const hasBadgeSlot = badgeChild != null;
  const showBadge = hasBadgeSlot && shouldShowBadge(badge);
  const iconOnly = Boolean(icon) && text == null;

  const button = (
    <button
      type="button"
      className={`${styles.root} ${icon && !iconOnly ? styles.withIcon : ""} ${iconOnly ? styles.iconOnly : ""} ${hasBadgeSlot ? styles.withBadge : ""} ${active ? styles.active : ""} ${className}`.trim()}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHasPopup}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
      {!iconOnly && (
        <span className={styles.copy}>
          <strong>{text}</strong>
        </span>
      )}
      {showBadge && <span className={styles.badge}>{badge}</span>}
    </button>
  );

  if (tooltipText.trim()) {
    return (
      <ButtonTooltipOverlay text={tooltipText} position={tooltipPosition}>
        {button}
      </ButtonTooltipOverlay>
    );
  }

  return button;
};

Button.Icon = ButtonIcon;
Button.Text = ButtonText;
Button.Tooltip = ButtonTooltip;
Button.Badge = ButtonBadge;
