import { useCallback, useEffect, useState } from "react";
import {
  isPremiumActive,
  getPremiumLabel,
  startTrial,
  activatePremium,
  getTrialDaysLeft,
  getOrCreateReferralCode,
  redeemReferralCode,
  devUnlockPremium,
} from "@/services/premiumService";

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [label, setLabel] = useState("Безкоштовно");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [premium, premiumLabel, daysLeft, code] = await Promise.all([
      isPremiumActive(),
      getPremiumLabel(),
      getTrialDaysLeft(),
      getOrCreateReferralCode(),
    ]);
    setIsPremium(premium);
    setLabel(premiumLabel);
    setTrialDaysLeft(daysLeft);
    setReferralCode(code);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const beginTrial = useCallback(async () => {
    await startTrial();
    await refresh();
  }, [refresh]);

  const purchaseMonthly = useCallback(async () => {
    await activatePremium("monthly", 1);
    await refresh();
  }, [refresh]);

  const purchaseYearly = useCallback(async () => {
    await activatePremium("yearly", 12);
    await refresh();
  }, [refresh]);

  const redeemCode = useCallback(
    async (code: string) => {
      const ok = await redeemReferralCode(code);
      if (ok) await refresh();
      return ok;
    },
    [refresh]
  );

  const devUnlock = useCallback(async () => {
    if (__DEV__) {
      await devUnlockPremium();
      await refresh();
    }
  }, [refresh]);

  return {
    isPremium,
    label,
    trialDaysLeft,
    referralCode,
    loading,
    refresh,
    beginTrial,
    purchaseMonthly,
    purchaseYearly,
    redeemCode,
    devUnlock,
  };
}
