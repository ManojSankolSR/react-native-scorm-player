var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
import WebView from "react-native-webview";
import { ScormService } from "../../services/ScormService";
const ScormPlayer = (_a) => {
    var { scormUrl, webViewRef, API, prevSCORMProgress } = _a, webViewProps = __rest(_a, ["scormUrl", "webViewRef", "API", "prevSCORMProgress"]);
    const scormBridgeScript = ScormService.getScormJSBridge(prevSCORMProgress);
    const handleMessage = (event) => {
        ScormService.handleMessage(event, API);
    };
    const [scormPlayerState, setScormPlayerState] = useState({
        data: null,
        isLoading: false,
        error: null,
    });
    const setScormPlayerStateCallback = (key, value) => {
        setScormPlayerState((prevState) => (Object.assign(Object.assign({}, prevState), { [key]: value })));
    };
    const fetchScormData = () => __awaiter(void 0, void 0, void 0, function* () {
        setScormPlayerStateCallback("isLoading", true);
        setScormPlayerStateCallback("error", null);
        try {
            const scormData = yield ScormService.launchScorm(scormUrl);
            setScormPlayerStateCallback("data", scormData);
            setScormPlayerStateCallback("isLoading", false);
        }
        catch (error) {
            setScormPlayerStateCallback("error", "Failed to fetch SCORM data: " + error);
            setScormPlayerStateCallback("isLoading", false);
        }
    });
    useEffect(() => {
        fetchScormData();
    }, []);
    return (<View style={styles.container}>
      {scormPlayerState.isLoading && (<View style={styles.loadingContainer}>
          {/* <ActivityIndicator size="large" color="#0000ff" /> */}
          <Text style={styles.loadingText}>Loading SCORM content...</Text>
        </View>)}
      {scormPlayerState.error && (<View style={styles.errorContainer}>
          <Text style={styles.errorText}>{scormPlayerState.error}</Text>
        </View>)}
      {scormPlayerState.data && (<WebView ref={webViewRef} injectedJavaScriptBeforeContentLoaded={scormBridgeScript} source={{
                uri: scormPlayerState.data.basePath +
                    "/" +
                    scormPlayerState.data.fileName,
            }} style={styles.webView} injectedJavaScript={scormBridgeScript} javaScriptEnabled domStorageEnabled startInLoadingState onMessage={handleMessage} onLoadStart={() => {
                setScormPlayerStateCallback("isLoading", true);
            }} cacheMode="LOAD_NO_CACHE" cacheEnabled={false} onLoadEnd={() => {
                setScormPlayerStateCallback("isLoading", false);
            }} onError={(e) => {
                setScormPlayerStateCallback("error", "Failed to load content: " + e.nativeEvent.description);
            }} originWhitelist={["*"]} allowFileAccess allowUniversalAccessFromFileURLs allowFileAccessFromFileURLs mixedContentMode="compatibility" sharedCookiesEnabled thirdPartyCookiesEnabled allowingReadAccessToURL={scormPlayerState.data.basePath} allowsInlineMediaPlayback mediaPlaybackRequiresUserAction setSupportMultipleWindows allowsBackForwardNavigationGestures webviewDebuggingEnabled {...webViewProps}/>)}
    </View>);
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
