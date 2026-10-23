import { useEffect, useState, type CSSProperties } from "react";
import { FiCheckSquare, FiClock, FiDollarSign } from "react-icons/fi";
import { useTranslation } from "../../i18n";
import "./RegisterShowcase.scss";

const BENEFITS = [
  {
    key: "time",
    icon: FiClock,
    titleKey: "benefitTimeTitle",
    bodyKey: "benefitTimeBody",
  },
  {
    key: "tasks",
    icon: FiCheckSquare,
    titleKey: "benefitTasksTitle",
    bodyKey: "benefitTasksBody",
  },
  {
    key: "budget",
    icon: FiDollarSign,
    titleKey: "benefitBudgetTitle",
    bodyKey: "benefitBudgetBody",
  },
] as const;

export default function RegisterShowcase() {
  const { t } = useTranslation();
  const copy = t.register;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`register-showcase ${mounted ? "register-showcase--ready" : ""}`}>
      <div className="register-showcase__copy">
        <p className="register-showcase__eyebrow">{copy.showcaseEyebrow}</p>
        <h2>{copy.showcaseTitle}</h2>
        <p>{copy.showcaseSubtitle}</p>
      </div>

      <ul className="register-showcase__benefits">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <li
              key={benefit.key}
              className="register-showcase__benefit register-showcase__anim"
              style={{ "--delay": `${0.12 + index * 0.1}s` } as CSSProperties}
            >
              <span className={`register-showcase__icon register-showcase__icon--${benefit.key}`}>
                <Icon />
              </span>
              <span>
                <strong>{copy[benefit.titleKey]}</strong>
                <span>{copy[benefit.bodyKey]}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <p className="register-showcase__footnote register-showcase__anim" style={{ "--delay": "0.48s" } as CSSProperties}>
        {copy.showcaseFootnote}
      </p>
    </div>
  );
}
