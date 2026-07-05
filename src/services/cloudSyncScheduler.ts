import { pushCloudSync } from "@/services/syncService";

let timer: ReturnType<typeof setTimeout> | null = null;

/** Відкладена синхронізація з хмарою (debounce 2 с) */
export function scheduleCloudSync(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    pushCloudSync().catch(() => {});
    timer = null;
  }, 2000);
}
