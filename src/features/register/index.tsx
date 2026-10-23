import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { FiCheck, FiCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../auth/auth";
import AllTrackLogoIcon from "../../components/all-track-logo/icon";
import { LanguageSwitcher, useTranslation } from "../../i18n";
import RegisterShowcase from "./RegisterShowcase";
import "./register.scss";

type FieldErrors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
  terms?: string;
  form?: string;
};

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordRules(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const copy = t.register;

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const rules = useMemo(() => passwordRules(password), [password]);
  const strengthScore = Object.values(rules).filter(Boolean).length;
  const strengthLabel = [
    copy.strengthWeak,
    copy.strengthWeak,
    copy.strengthFair,
    copy.strengthGood,
    copy.strengthGood,
    copy.strengthStrong,
  ][strengthScore];

  const clearError = (key: keyof FieldErrors) => {
    setErrors((current) => {
      if (!current[key] && !current.form) return current;
      const next = { ...current };
      delete next[key];
      delete next.form;
      return next;
    });
  };

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const trimmedName = name.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) next.name = copy.errorNameRequired;
    else if (trimmedName.length < 2) next.name = copy.errorNameShort;

    if (!trimmedUsername) next.username = copy.errorUsernameRequired;
    else if (!USERNAME_PATTERN.test(trimmedUsername)) {
      next.username = copy.errorUsernameInvalid;
    }

    if (!trimmedEmail) next.email = copy.errorEmailRequired;
    else if (!EMAIL_PATTERN.test(trimmedEmail)) next.email = copy.errorEmailInvalid;

    if (!password) next.password = copy.errorPasswordRequired;
    else if (strengthScore < 5) next.password = copy.errorPasswordWeak;

    if (!confirm) next.confirm = copy.errorConfirmRequired;
    else if (confirm !== password) next.confirm = copy.errorConfirmMismatch;

    if (!acceptedTerms) next.terms = copy.errorTerms;

    return next;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    const result = await register({
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (!result.ok) {
      if (result.reason === "username") {
        setErrors({ username: copy.errorUsernameTaken });
      } else if (result.reason === "email") {
        setErrors({ email: copy.errorEmailTaken });
      } else {
        setErrors({ form: copy.errorGeneric });
      }
      return;
    }

    navigate("/app/overview", { replace: true });
  };

  return (
    <div className="register-page">
      <section className="register-page__form-panel">
        <header className="register-page__topbar">
          <div className="register-page__brand">
            <AllTrackLogoIcon className="register-page__brand-icon" />
            <span className="register-page__brand-text">
              <span className="register-page__brand-all">All</span>
              <span className="register-page__brand-track">Track</span>
            </span>
          </div>
          <LanguageSwitcher variant="compact" />
        </header>

        <div className="register-page__form-wrap">
          <div className="register-page__intro">
            <span className="register-page__badge">{copy.badge}</span>
            <h1>{copy.title}</h1>
            <p>{copy.subtitle}</p>
          </div>

          <form
            className={`register-page__form ${errors.form ? "register-page__form--error" : ""}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="register-page__grid">
              <Field
                id="register-name"
                label={copy.fullName}
                error={errors.name}
              >
                <input
                  id="register-name"
                  type="text"
                  autoComplete="name"
                  placeholder={copy.fullNamePlaceholder}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "register-name-error" : undefined}
                  required
                />
              </Field>

              <Field
                id="register-username"
                label={copy.username}
                error={errors.username}
              >
                <input
                  id="register-username"
                  type="text"
                  autoComplete="username"
                  placeholder={copy.usernamePlaceholder}
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    clearError("username");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={
                    errors.username ? "register-username-error" : undefined
                  }
                  required
                />
              </Field>
            </div>

            <Field id="register-email" label={copy.email} error={errors.email}>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder={copy.emailPlaceholder}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearError("email");
                }}
                disabled={loading}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : undefined}
                required
              />
            </Field>

            <Field
              id="register-password"
              label={copy.password}
              error={errors.password}
            >
              <div className="register-page__password-wrap">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={copy.passwordPlaceholder}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    clearError("password");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "register-password-error register-password-strength"
                      : "register-password-strength"
                  }
                  required
                />
                <button
                  type="button"
                  className="register-page__password-toggle"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>

            <div
              id="register-password-strength"
              className="register-page__strength"
            >
                <div className="register-page__strength-meta">
                  <span>{copy.strengthLabel}</span>
                  {password ? <strong data-score={strengthScore}>{strengthLabel}</strong> : null}
                </div>
                <div className="register-page__strength-bar" aria-hidden="true">
                  {Array.from({ length: 4 }, (_, index) => (
                    <span
                      key={index}
                      data-on={strengthScore >= index + 1}
                      data-score={strengthScore}
                    />
                  ))}
                </div>
                <ul className="register-page__rules">
                  <Rule met={rules.length} label={copy.reqLength} />
                  <Rule met={rules.upper} label={copy.reqUpper} />
                  <Rule met={rules.lower} label={copy.reqLower} />
                  <Rule met={rules.number} label={copy.reqNumber} />
                  <Rule met={rules.special} label={copy.reqSpecial} />
                </ul>
            </div>

            <Field
              id="register-confirm"
              label={copy.confirmPassword}
              error={errors.confirm}
            >
              <div className="register-page__password-wrap">
                <input
                  id="register-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={copy.confirmPlaceholder}
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    clearError("confirm");
                  }}
                  disabled={loading}
                  aria-invalid={Boolean(errors.confirm)}
                  aria-describedby={
                    errors.confirm ? "register-confirm-error" : undefined
                  }
                  required
                />
                <button
                  type="button"
                  className="register-page__password-toggle"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? copy.hidePassword : copy.showPassword}
                  tabIndex={-1}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </Field>

            <div className="register-page__terms">
              <label>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => {
                    setAcceptedTerms(event.target.checked);
                    clearError("terms");
                  }}
                  disabled={loading}
                />
                <span>{copy.terms}</span>
              </label>
              {errors.terms ? (
                <p className="register-page__field-error" role="alert">
                  {errors.terms}
                </p>
              ) : null}
            </div>

            {errors.form ? (
              <p className="register-page__error" role="alert">
                {errors.form}
              </p>
            ) : null}

            <button
              type="submit"
              className="register-page__submit"
              disabled={loading}
            >
              {loading ? <span className="register-page__spinner" /> : copy.createAccount}
            </button>

            <div className="register-page__divider">
              <span>{copy.orSignUpWith}</span>
            </div>

            <div className="register-page__social">
              <button type="button" className="register-page__social-btn" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {copy.google}
              </button>
              <button type="button" className="register-page__social-btn" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.46 2.2-1.21 2.96-.77.78-1.8 1.22-2.89 1.22-.05-1.15.48-2.24 1.23-3 .75-.77 1.78-1.22 2.87-1.18zm2.52 4.37c-1.61-.09-2.97.92-3.74.92-.79 0-1.95-.88-3.22-.86-1.66.03-3.18.96-4.03 2.44-1.72 2.98-.44 7.39 1.23 9.81.82 1.18 1.8 2.5 3.09 2.45 1.24-.05 1.71-.8 3.21-.8 1.5 0 1.92.8 3.23.77 1.34-.02 2.18-1.2 2.99-2.38.94-1.37 1.33-2.7 1.35-2.77-.03-.01-2.6-1-2.62-3.96-.02-2.5 2.02-3.7 2.11-3.76-1.15-1.68-2.94-1.9-3.57-1.94z" />
                </svg>
                {copy.apple}
              </button>
            </div>
          </form>

          <p className="register-page__login">
            {copy.hasAccount}{" "}
            <Link to="/login" className="register-page__link">
              {copy.logIn}
            </Link>
          </p>
        </div>

        <footer className="register-page__footer">
          <span>{copy.copyright}</span>
          <button type="button" className="register-page__link" disabled>
            {copy.privacyPolicy}
          </button>
        </footer>
      </section>

      <section className="register-page__showcase">
        <div className="register-page__showcase-bg" aria-hidden="true">
          <div className="register-page__orb register-page__orb--1" />
          <div className="register-page__orb register-page__orb--2" />
          <div className="register-page__orb register-page__orb--3" />
        </div>
        <RegisterShowcase />
      </section>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={`register-page__field ${error ? "register-page__field--invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="register-page__field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Rule({ met, label }: { met: boolean; label: string }) {
  return (
    <li className={met ? "is-met" : undefined}>
      {met ? <FiCheck aria-hidden="true" /> : <FiCircle aria-hidden="true" />}
      <span>{label}</span>
    </li>
  );
}
