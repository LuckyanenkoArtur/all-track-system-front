import {
  findRegisteredAccount,
  saveRegisteredAccount,
  type RegisteredAccount,
  type RegisterFailure,
} from "./accounts";
import { DEV_CREDENTIALS } from "./constants";
import { getAuthToken, removeAuthToken, setAuthToken } from "./cookies";

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export async function login(
  username: string,
  password: string,
  remember = false,
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const registered = findRegisteredAccount(username);
  const isValid =
    (username === DEV_CREDENTIALS.username &&
      password === DEV_CREDENTIALS.password) ||
    (registered !== undefined && registered.password === password);

  if (!isValid) return false;

  setAuthToken(`alltrack-session-${Date.now()}`, remember ? 30 : 1);
  return true;
}

export async function register(
  account: RegisteredAccount,
): Promise<{ ok: true } | { ok: false; reason: RegisterFailure }> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  const saved = saveRegisteredAccount(account);
  if (!saved.ok) return saved;

  setAuthToken(`alltrack-session-${Date.now()}`, 30);
  return { ok: true };
}

export function logout(): void {
  removeAuthToken();
}
