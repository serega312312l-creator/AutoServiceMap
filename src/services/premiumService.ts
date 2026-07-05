import { TRIAL_DAYS } from "@/constants/premium";
import { generateId, getJson, setJson } from "@/services/storageUtils";

const PREMIUM_KEY = "avtogid:premium";
const TRIAL_KEY = "avtogid:trial_start";
const REFERRAL_KEY = "avtogid:referral_code";

interface PremiumState {
  active: boolean;
  expiresAt?: string;
  plan?: "monthly" | "yearly" | "trial" | "referral";
}

export async function getPremiumState(): Promise<PremiumState> {
  return getJson<PremiumState>(PREMIUM_KEY, { active: false });
}

export async function isPremiumActive(): Promise<boolean> {
  const state = await getPremiumState();
  if (!state.active) {
    const trial = await isTrialActive();
    return trial;
  }
  if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
    await setJson(PREMIUM_KEY, { active: false });
    return false;
  }
  return true;
}

export async function getTrialStart(): Promise<string | null> {
  return AsyncStorageGet(TRIAL_KEY);
}

async function AsyncStorageGet(key: string): Promise<string | null> {
  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  return AsyncStorage.getItem(key);
}

export async function startTrial(): Promise<boolean> {
  const existing = await getTrialStart();
  if (existing) return isTrialActive();

  const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
  await AsyncStorage.setItem(TRIAL_KEY, new Date().toISOString());
  return true;
}

export async function isTrialActive(): Promise<boolean> {
  const start = await getTrialStart();
  if (!start) return false;
  const startDate = new Date(start);
  const days = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  return days <= TRIAL_DAYS;
}

export async function getTrialDaysLeft(): Promise<number> {
  const start = await getTrialStart();
  if (!start) return TRIAL_DAYS;
  const startDate = new Date(start);
  const days = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - days));
}

export async function activatePremium(
  plan: "monthly" | "yearly",
  months: number
): Promise<void> {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + months);
  await setJson(PREMIUM_KEY, {
    active: true,
    plan,
    expiresAt: expires.toISOString(),
  });
}

export async function activateReferralPremium(): Promise<void> {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30);
  await setJson(PREMIUM_KEY, {
    active: true,
    plan: "referral",
    expiresAt: expires.toISOString(),
  });
}

export async function getOrCreateReferralCode(): Promise<string> {
  let code = await AsyncStorageGet(REFERRAL_KEY);
  if (!code) {
    code = `AVTO${generateId().slice(-6).toUpperCase()}`;
    const { default: AsyncStorage } = await import("@react-native-async-storage/async-storage");
    await AsyncStorage.setItem(REFERRAL_KEY, code);
  }
  return code;
}

export async function redeemReferralCode(_code: string): Promise<boolean> {
  if (_code.startsWith("AVTO") && _code.length >= 8) {
    await activateReferralPremium();
    return true;
  }
  return false;
}

/** Для тестування в dev-збірці */
export async function devUnlockPremium(): Promise<void> {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);
  await setJson(PREMIUM_KEY, {
    active: true,
    plan: "yearly",
    expiresAt: expires.toISOString(),
  });
}

export async function getPremiumLabel(): Promise<string> {
  const premium = await isPremiumActive();
  if (!premium) return "Безкоштовно";
  const state = await getPremiumState();
  if (state.plan === "trial" || (await isTrialActive())) {
    const left = await getTrialDaysLeft();
    return `Пробний (${left} дн.)`;
  }
  if (state.plan === "referral") return "Premium (реферал)";
  if (state.plan === "yearly") return "Premium (рік)";
  if (state.plan === "monthly") return "Premium (місяць)";
  return "Premium";
}
