import { WebViewMessageEvent } from "react-native-webview/lib/WebViewTypes";
import { API } from "../models/API";
import { SCORMDataModel } from "../models/SCORMDataModel";
export declare class ScormService {
    private static fileExists;
    private static readManifestFile;
    static launchScorm: (destinationPath: string) => Promise<{
        basePath: string;
        fileName: string;
    }>;
    private static detectScormLaunchFile;
    private static findScormLaunchFile;
    static getScormJSBridge: (prevSCORMProgress: SCORMDataModel) => string;
    static handleMessage: (event: WebViewMessageEvent, API: API) => void;
}
