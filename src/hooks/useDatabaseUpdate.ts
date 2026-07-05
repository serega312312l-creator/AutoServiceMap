import { useCallback, useEffect, useState } from "react";
import {
  checkAndUpdateDatabase,
  getDatabaseUpdateStatus,
  DatabaseUpdateStatus,
} from "@/services/databaseUpdateService";
import { isDeviceOnline } from "@/services/networkService";
import { UserLocation } from "@/types/place";
import { loadLocalDatabase } from "@/services/localDatabaseService";

/** Визначити регіон користувача за найближчими записами */
async function guessRegionIdsNear(location: UserLocation): Promise<string[]> {
  const records = await loadLocalDatabase();
  const nearby = records
    .filter((r) => r.region_id)
    .map((r) => ({
      id: r.region_id!,
      dist:
        Math.abs(r.latitude - location.latitude) + Math.abs(r.longitude - location.longitude),
    }))
    .sort((a, b) => a.dist - b.dist);

  const ids = new Set<string>();
  for (const n of nearby.slice(0, 3)) ids.add(n.id);
  return [...ids];
}

export function useDatabaseUpdate(location: UserLocation | null) {
  const [status, setStatus] = useState<DatabaseUpdateStatus | null>(null);

  const refreshStatus = useCallback(async () => {
    setStatus(await getDatabaseUpdateStatus());
  }, []);

  const runUpdate = useCallback(
    async (force = false) => {
      const priorityRegionIds = location ? await guessRegionIdsNear(location) : [];
      const current = await getDatabaseUpdateStatus();
      setStatus({ ...current, downloading: true });
      const result = await checkAndUpdateDatabase({
        force,
        priorityRegionIds,
        onProgress: (msg) => setStatus((s) => (s ? { ...s, message: msg } : s)),
      });
      setStatus(result);
      return result;
    },
    [location]
  );

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    let cancelled = false;

    async function autoUpdate() {
      const online = await isDeviceOnline();
      if (!online || cancelled) return;
      await runUpdate(false);
    }

    const timer = setTimeout(autoUpdate, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [runUpdate]);

  return { status, runUpdate, refreshStatus };
}
