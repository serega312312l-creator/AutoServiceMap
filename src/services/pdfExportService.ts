import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { HistoryEntry } from "@/types/history";
import { Place } from "@/types/place";
import { formatHistoryForExport } from "@/services/historyService";

function buildInsuranceHtml(
  place: Place | null,
  location?: { lat: number; lng: number },
  entries?: HistoryEntry[]
): string {
  const now = new Date().toLocaleString("uk-UA");
  const historyText = entries ? formatHistoryForExport(entries).replace(/\n/g, "<br/>") : "";

  return `
    <html><head><meta charset="utf-8"><style>
      body{font-family:sans-serif;padding:20px;color:#111}
      h1{color:#dc2626} .row{margin:8px 0} .label{color:#666;font-size:12px}
    </style></head><body>
    <h1>AVTOGID — звіт для страхової</h1>
    <p>Дата: ${now}</p>
    ${location ? `<div class="row"><span class="label">Координати:</span> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>` : ""}
    ${place ? `
      <div class="row"><span class="label">СТО / сервіс:</span> ${place.name}</div>
      <div class="row"><span class="label">Адреса:</span> ${place.address ?? "—"}</div>
      <div class="row"><span class="label">Телефон:</span> ${place.phone ?? "—"}</div>
    ` : ""}
    <h2>Історія подій</h2>
    <p>${historyText || "—"}</p>
    <p style="margin-top:40px;font-size:11px;color:#888">Згенеровано AVTOGID · Україна</p>
    </body></html>`;
}

export async function exportInsurancePdf(options: {
  place?: Place | null;
  location?: { lat: number; lng: number };
  entries?: HistoryEntry[];
}): Promise<void> {
  const html = buildInsuranceHtml(options.place ?? null, options.location, options.entries);
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: "AVTOGID — звіт для страхової",
    });
  }
}
