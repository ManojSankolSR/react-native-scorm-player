import React from "react";
import WebView, { WebViewProps } from "react-native-webview";
import { SCORMDataModel } from "../../models/SCORMDataModel";
import { API } from "../../models/API";
interface ScormPlayerProps extends WebViewProps {
    scormUrl: string;
    webViewRef: React.RefObject<WebView<{}> | null>;
    API: API;
    prevSCORMProgress: SCORMDataModel;
}
declare const ScormPlayer: React.FC<ScormPlayerProps>;
export default ScormPlayer;
