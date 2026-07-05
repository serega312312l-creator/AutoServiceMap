import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { getWidgetSnapshot } from "@/services/widgetDataService";
import { AvtogidHomeWidget } from "@/widgets/android/AvtogidHomeWidget";
import { WIDGET_NAME } from "@/widgets/android/constants";

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== WIDGET_NAME) return;

  const data = await getWidgetSnapshot();

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED":
      props.renderWidget(<AvtogidHomeWidget data={data} />);
      break;
    default:
      break;
  }
}
