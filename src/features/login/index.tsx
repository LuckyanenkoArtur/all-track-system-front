import { type FormEvent, useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../auth/auth";
import { LanguageSwitcher, useTranslation } from "../../i18n";
import AllTrackPreview from "./login/AllTrackPreview";
import AllTrackLogoIcon from "../../components/all-track-logo/icon";
import "./login.scss";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const success = await login(username.trim(), password, remember);
    setLoading(false);

    if (success) {
      navigate("/app/overview", { replace: true });
      return;
    }

    setError(t.login.invalidCredentials);
  };

  return (
    <div className="login-page">
      <section className="login-page__form-panel">
        <header className="login-page__topbar">
          <div className="login-page__brand">
            <AllTrackLogoIcon className="login-page__brand-icon" />
            <span className="login-page__brand-text">
              <span className="login-page__brand-all">All</span>
              <span className="login-page__brand-track">Track</span>
            </span>
          </div>
          <LanguageSwitcher variant="compact" />
        </header>

        <div className="login-page__form-wrap">
          <div className="login-page__intro">
            <h1>{t.login.welcome}</h1>
            <p>{t.login.subtitle}</p>
          </div>

          <form
            className={`login-page__form ${error ? "login-page__form--error" : ""}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="login-page__field">
              <label htmlFor="username">{t.login.username}</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="login-page__field">
              <label htmlFor="password">{t.login.password}</label>
              <div className="login-page__password-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-page__password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? t.login.hidePassword : t.login.showPassword
                  }
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="login-page__row">
              <label className="login-page__remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                />
                <span>{t.login.rememberMe}</span>
              </label>
              <button type="button" className="login-page__link" disabled>
                {t.login.forgotPassword}
              </button>
            </div>

            {error && (
              <p className="login-page__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="login-page__submit"
              disabled={loading}
            >
              {loading ? <span className="login-page__spinner" /> : t.login.logIn}
            </button>

            <div className="login-page__divider">
              <span>{t.login.orLoginWith}</span>
            </div>

            <div className="login-page__social">
              <button type="button" className="login-page__social-btn" disabled>
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
                {t.login.google}
              </button>
              <button type="button" className="login-page__social-btn" disabled>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M16.365 1.43c0 1.14-.46 2.2-1.21 2.96-.77.78-1.8 1.22-2.89 1.22-.05-1.15.48-2.24 1.23-3 .75-.77 1.78-1.22 2.87-1.18zm2.52 4.37c-1.61-.09-2.97.92-3.74.92-.79 0-1.95-.88-3.22-.86-1.66.03-3.18.96-4.03 2.44-1.72 2.98-.44 7.39 1.23 9.81.82 1.18 1.8 2.5 3.09 2.45 1.24-.05 1.71-.8 3.21-.8 1.5 0 1.92.8 3.23.77 1.34-.02 2.18-1.2 2.99-2.38.94-1.37 1.33-2.7 1.35-2.77-.03-.01-2.6-1-2.62-3.96-.02-2.5 2.02-3.7 2.11-3.76-1.15-1.68-2.94-1.9-3.57-1.94z" />
                </svg>
                {t.login.apple}
              </button>
            </div>
          </form>

          <p className="login-page__register">
            {t.login.noAccount}{" "}
            <Link to="/register" className="login-page__link">
              {t.login.registerNow}
            </Link>
          </p>
        </div>

        <footer className="login-page__footer">
          <span>{t.login.copyright}</span>
          <button type="button" className="login-page__link" disabled>
            {t.login.privacyPolicy}
          </button>
        </footer>
      </section>

      <section className="login-page__showcase">
        <div className="login-page__showcase-bg" aria-hidden="true">
          <div className="login-page__orb login-page__orb--1" />
          <div className="login-page__orb login-page__orb--2" />
          <div className="login-page__orb login-page__orb--3" />
        </div>
        <AllTrackPreview />
      </section>
    </div>
  );
}
