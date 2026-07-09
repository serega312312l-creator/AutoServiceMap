import { useCallback, useEffect, useState } from "react";
import { HistoryEntry } from "@/types/history";
import { Place } from "@/types/place";
import { ScenarioId } from "@/types/scenario";
import {
  getHistory,
  recordVisit,
  recordCall,
  recordRoute,
  recordBreakdown,
  recordSos,
  recordShareLocation,
  clearHistory,
  formatHistoryForExport,
} from "@/services/historyService";

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setEntries(await getHistory());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    entries,
    loading,
    refresh,
    logVisit: async (p: Place) => { await recordVisit(p); await refresh(); },
    logCall: async (p: Place) => { await recordCall(p); await refresh(); },
    logRoute: async (p: Place) => { await recordRoute(p); await refresh(); },
    logBreakdown: async (id?: ScenarioId) => { await recordBreakdown(id); await refresh(); },
    logSos: async (note?: string) => { await recordSos(note); await refresh(); },
    logShare: async (lat: number, lng: number) => { await recordShareLocation(lat, lng); await refresh(); },
    clear: async () => { await clearHistory(); await refresh(); },
    exportText: () => formatHistoryForExport(entries),
  };
}
