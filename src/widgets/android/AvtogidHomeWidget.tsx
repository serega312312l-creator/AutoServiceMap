import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import type { WidgetSnapshot } from "@/services/widgetDataService";

export function AvtogidHomeWidget({ data }: { data: WidgetSnapshot }) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#0f172a",
        borderRadius: 16,
        padding: 12,
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: "avtogid://" }}
    >
      <FlexWidget
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
      >
        <TextWidget text="AVTOGID" style={{ fontSize: 11, color: "#60a5fa", fontWeight: "700" }} />
        <TextWidget text={data.nearestDistance} style={{ fontSize: 11, color: "#4ade80" }} />
      </FlexWidget>

      <TextWidget
        text={data.nearestName}
        style={{ fontSize: 15, color: "#f8fafc", fontWeight: "800" }}
        maxLines={2}
      />

      <FlexWidget style={{ flexDirection: "row" }}>
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: "#2563eb",
            borderRadius: 8,
            padding: 8,
            alignItems: "center",
            marginRight: 4,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: "avtogid://breakdown" }}
        >
          <TextWidget text="🆘 112" style={{ fontSize: 12, color: "#fff", fontWeight: "700" }} />
        </FlexWidget>
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: "#1e293b",
            borderRadius: 8,
            padding: 8,
            alignItems: "center",
            marginLeft: 4,
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: "avtogid://stress" }}
        >
          <TextWidget text="⚡ СТО" style={{ fontSize: 12, color: "#f8fafc", fontWeight: "700" }} />
        </FlexWidget>
      </FlexWidget>

      <TextWidget
        text={`СТО: ${data.stoName.slice(0, 28)}`}
        style={{ fontSize: 9, color: "#64748b" }}
        maxLines={1}
      />
    </FlexWidget>
  );
}
