import { View, Text, StyleSheet } from "react-native";
import React, { use, useEffect, useRef, useState } from "react";
import WebView, { WebViewProps } from "react-native-webview";
import { ScormService } from "../../services/ScormService";
import {
  WebViewEvent,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import { SCORMDataModel } from "../../models/SCORMDataModel";
import { API } from "../../models/API";

interface ScormPlayerProps extends WebViewProps {
  scormUrl: string;
  webViewRef: React.RefObject<WebView<{}> | null>;
  API: API;
  prevSCORMProgress: SCORMDataModel;
}

interface ScormPlayerInitialState {
  data: {
    basePath: string;
    fileName: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const ScormPlayer: React.FC<ScormPlayerProps> = ({
  scormUrl,
  webViewRef,
  API,
  prevSCORMProgress,
  ...webViewProps
}: ScormPlayerProps) => {
  const scormBridgeScript = ScormService.getScormJSBridge(prevSCORMProgress);
  const handleMessage = (event: WebViewMessageEvent) => {
    ScormService.handleMessage(event, API);
  };

  const [scormPlayerState, setScormPlayerState] =
    useState<ScormPlayerInitialState>({
      data: null,
      isLoading: false,
      error: null,
    });

  const setScormPlayerStateCallback = (
    key: keyof ScormPlayerInitialState,
    value: any
  ) => {
    setScormPlayerState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const fetchScormData = async () => {
    setScormPlayerStateCallback("isLoading", true);
    setScormPlayerStateCallback("error", null);
    try {
      const scormData = await ScormService.launchScorm(scormUrl);
      setScormPlayerStateCallback("data", scormData);
      setScormPlayerStateCallback("isLoading", false);
    } catch (error) {
      setScormPlayerStateCallback(
        "error",
        "Failed to fetch SCORM data: " + error
      );
      setScormPlayerStateCallback("isLoading", false);
    }
  };

  useEffect(() => {
    fetchScormData();
  }, []);

  return (
    <View style={styles.container}>
      {scormPlayerState.isLoading && (
        <View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color="#0000ff" /> */}
          <Text style={styles.loadingText}>Loading SCORM content...</Text>
        </View>
      )}
      {scormPlayerState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{scormPlayerState.error}</Text>
        </View>
      )}
      {scormPlayerState.data && (
        <WebView
          ref={webViewRef}
          injectedJavaScriptBeforeContentLoaded={scormBridgeScript}
          source={{
            uri:
              scormPlayerState.data.basePath +
              "/" +
              scormPlayerState.data.fileName,
          }}
          style={styles.webView}
          injectedJavaScript={scormBridgeScript}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          onMessage={handleMessage}
          onLoadStart={() => {
            setScormPlayerStateCallback("isLoading", true);
          }}
          cacheMode="LOAD_NO_CACHE"
          cacheEnabled={false}
          onLoadEnd={() => {
            setScormPlayerStateCallback("isLoading", false);
          }}
          onError={(e) => {
            setScormPlayerStateCallback(
              "error",
              "Failed to load content: " + e.nativeEvent.description
            );
          }}
          originWhitelist={["*"]}
          allowFileAccess
          allowUniversalAccessFromFileURLs
          allowFileAccessFromFileURLs
          mixedContentMode="compatibility"
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          allowingReadAccessToURL={scormPlayerState.data.basePath}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction
          setSupportMultipleWindows
          allowsBackForwardNavigationGestures
          webviewDebuggingEnabled
          {...webViewProps}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#F5FCFF",
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#ffeeee",
    borderRadius: 5,
    margin: 10,
  },
  errorText: {
    color: "#dd0000",
    fontSize: 16,
  },
  progressBar: {
    height: 20,
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#eeeeee",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  progressText: {
    position: "absolute",
    right: 10,
    color: "#000000",
    fontWeight: "bold",
  },
});

export default ScormPlayer;
