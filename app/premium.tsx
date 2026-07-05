import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  FREE_ALWAYS,
  PREMIUM_FEATURES,
  PREMIUM_MONTHLY_UAH,
  PREMIUM_YEARLY_UAH,
  TRIAL_DAYS,
} from "@/constants/premium";
import { usePremium } from "@/hooks/usePremium";

export default function PremiumScreen() {
  const {
    isPremium,
    label,
    trialDaysLeft,
    referralCode,
    loading,
    beginTrial,
    purchaseMonthly,
    purchaseYearly,
    redeemCode,
    devUnlock,
  } = usePremium();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const handlePurchase = async (type: "monthly" | "yearly") => {
    setBusy(true);
    if (type === "monthly") await purchaseMonthly();
    else await purchaseYearly();
    setBusy(false);
  };

  const shareReferral = () => {
    Share.share({
      message: `Спробуй AVTOGID — автодопомога офлайн! Мій код: ${referralCode}`,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#60a5fa" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.crown}>👑</Text>
      <Text style={styles.title}>AVTOGID Premium</Text>
      <Text style={styles.status}>Статус: {label}</Text>

      {isPremium ? (
        <View style={styles.activeBox}>
          <Text style={styles.activeText}>✅ Premium активний. Дякуємо за підтримку!</Text>
        </View>
      ) : (
        <>
          <Pressable style={styles.trialBtn} onPress={beginTrial} disabled={busy}>
            <Text style={styles.trialBtnText}>
              🎁 Спробувати {TRIAL_DAYS} днів безкоштовно
            </Text>
          </Pressable>
          {trialDaysLeft < TRIAL_DAYS && trialDaysLeft > 0 ? (
            <Text style={styles.trialLeft}>Залишилось {trialDaysLeft} дн. пробного</Text>
          ) : null}
        </>
      )}

      <Text style={styles.sectionTitle}>Що входить у Premium</Text>
      {PREMIUM_FEATURES.map((f) => (
        <View key={f.title} style={styles.feature}>
          <Text style={styles.featureIcon}>{f.icon}</Text>
          <View style={styles.featureText}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Завжди безкоштовно</Text>
      {FREE_ALWAYS.map((f) => (
        <Text key={f} style={styles.freeItem}>✓ {f}</Text>
      ))}

      {!isPremium ? (
        <View style={styles.pricing}>
          <Pressable style={styles.priceBtn} onPress={() => handlePurchase("monthly")} disabled={busy}>
            <Text style={styles.priceAmount}>{PREMIUM_MONTHLY_UAH} грн/міс</Text>
            <Text style={styles.priceSub}>Скасувати будь-коли</Text>
          </Pressable>
          <Pressable style={[styles.priceBtn, styles.priceBtnBest]} onPress={() => handlePurchase("yearly")} disabled={busy}>
            <Text style={styles.bestBadge}>ВИГІДНО</Text>
            <Text style={styles.priceAmount}>{PREMIUM_YEARLY_UAH} грн/рік</Text>
            <Text style={styles.priceSub}>≈2 місяці в подарунок</Text>
          </Pressable>
          <Text style={styles.payNote}>
            Оплата через Google Play буде підключена після публікації. Зараз — тестовий доступ.
          </Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>Запросити друга</Text>
      <Text style={styles.refCode}>Ваш код: {referralCode}</Text>
      <Pressable style={styles.shareBtn} onPress={shareReferral}>
        <Text style={styles.shareBtnText}>Поділитися кодом</Text>
      </Pressable>

      <View style={styles.codeRow}>
        <TextInput
          style={styles.codeInput}
          placeholder="Код друга (AVTO...)"
          placeholderTextColor="#64748b"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />
        <Pressable
          style={styles.codeBtn}
          onPress={async () => {
            const ok = await redeemCode(code.trim());
            if (!ok) Alert.alert("Помилка", "Невірний код");
          }}
        >
          <Text style={styles.codeBtnText}>OK</Text>
        </Pressable>
      </View>

      {__DEV__ ? (
        <Pressable style={styles.devBtn} onPress={devUnlock}>
          <Text style={styles.devText}>DEV: Unlock Premium</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a" },
  crown: { fontSize: 48, textAlign: "center" },
  title: { color: "#fbbf24", fontSize: 26, fontWeight: "800", textAlign: "center" },
  status: { color: "#94a3b8", textAlign: "center", marginTop: 4, marginBottom: 16 },
  activeBox: { backgroundColor: "#14532d", padding: 14, borderRadius: 12, marginBottom: 16 },
  activeText: { color: "#86efac", fontWeight: "700", textAlign: "center" },
  trialBtn: { backgroundColor: "#2563eb", padding: 16, borderRadius: 14, marginBottom: 8 },
  trialBtnText: { color: "#fff", fontWeight: "800", textAlign: "center", fontSize: 16 },
  trialLeft: { color: "#93c5fd", textAlign: "center", marginBottom: 16 },
  sectionTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 16, marginTop: 20, marginBottom: 10 },
  feature: { flexDirection: "row", gap: 12, marginBottom: 10, alignItems: "flex-start" },
  featureIcon: { fontSize: 22 },
  featureText: { flex: 1 },
  featureTitle: { color: "#e2e8f0", fontWeight: "700" },
  featureDesc: { color: "#64748b", fontSize: 13, marginTop: 2 },
  freeItem: { color: "#4ade80", marginBottom: 4, fontSize: 14 },
  pricing: { marginTop: 16, gap: 10 },
  priceBtn: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
  },
  priceBtnBest: { borderColor: "#fbbf24", backgroundColor: "#422006" },
  bestBadge: { color: "#fbbf24", fontWeight: "800", fontSize: 11, marginBottom: 4 },
  priceAmount: { color: "#f8fafc", fontSize: 20, fontWeight: "800" },
  priceSub: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  payNote: { color: "#64748b", fontSize: 11, textAlign: "center", lineHeight: 16 },
  refCode: { color: "#93c5fd", fontWeight: "700", fontSize: 16, marginBottom: 8 },
  shareBtn: { backgroundColor: "#334155", padding: 12, borderRadius: 10, alignItems: "center" },
  shareBtnText: { color: "#f8fafc", fontWeight: "700" },
  codeRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  codeInput: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 12,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  codeBtn: { backgroundColor: "#2563eb", paddingHorizontal: 16, justifyContent: "center", borderRadius: 10 },
  codeBtnText: { color: "#fff", fontWeight: "700" },
  devBtn: { marginTop: 20, padding: 10, alignItems: "center" },
  devText: { color: "#64748b", fontSize: 12 },
});
