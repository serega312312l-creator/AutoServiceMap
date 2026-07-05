import React from "react";
import { requestWidgetUpdate } from "react-native-android-widget";
import { WidgetSnapshot } from "@/services/widgetDataService";
import { AvtogidHomeWidget } from "@/widgets/android/AvtogidHomeWidget";
import { WIDGET_NAME } from "@/widgets/android/constants";

export async function refreshAndroidWidget(snapshot: WidgetSnapshot): Promise<void> {
  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => <AvtogidHomeWidget data={snapshot} />,
  });
}
