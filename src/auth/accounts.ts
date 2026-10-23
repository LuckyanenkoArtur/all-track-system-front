import { DEV_CREDENTIALS } from "./constants";

const STORAGE_KEY = "alltrack_accounts";

export type RegisteredAccount = {
  name: string;
  username: string;
  email: string;
  password: string;
};

export type RegisterFailure = "username" | "email" | "storage";

function isAccount(value: unknown): value is RegisteredAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Record<string, unknown>;
  return (
    typeof account.name === "string" &&
    typeof account.username === "string" &&
    typeof account.email === "string" &&
    typeof account.password === "string"
  );
}

function readAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAccount);
  } catch {
    return [];
  }
}

export function findRegisteredAccount(
  username: string,
): RegisteredAccount | undefined {
  const key = username.trim().toLowerCase();
  return readAccounts().find(
    (account) => account.username.toLowerCase() === key,
  );
}

export function saveRegisteredAccount(
  account: RegisteredAccount,
): { ok: true } | { ok: false; reason: RegisterFailure } {
  const username = account.username.trim();
  const email = account.email.trim().toLowerCase();
  const accounts = readAccounts();
  const usernameTaken =
    username.toLowerCase() === DEV_CREDENTIALS.username.toLowerCase() ||
    accounts.some((item) => item.username.toLowerCase() === username.toLowerCase());

  if (usernameTaken) return { ok: false, reason: "username" };

  if (accounts.some((item) => item.email.toLowerCase() === email)) {
    return { ok: false, reason: "email" };
  }

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        ...accounts,
        {
          name: account.name.trim(),
          username,
          email,
          password: account.password,
        },
      ]),
    );
    return { ok: true };
  } catch {
    return { ok: false, reason: "storage" };
  }
}
