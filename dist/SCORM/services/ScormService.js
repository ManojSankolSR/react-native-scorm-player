var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
import RNFS from "react-native-fs";
import { xml2js } from "xml-js";
import axios from "axios";
export class ScormService {
    static fileExists(path) {
        return __awaiter(this, void 0, void 0, function* () {
            if (path.startsWith("http://") || path.startsWith("https://")) {
                // Handle web URLs
                try {
                    const response = yield axios.head(path); // Use HEAD request to check file existence
                    return response.status === 200;
                }
                catch (error) {
                    console.warn(`File does not exist at URL: ${path}`, error);
                    return false;
                }
            }
            else {
                // Handle local file paths
                return RNFS.exists(path);
            }
        });
    }
    static readManifestFile(manifestPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (manifestPath.startsWith("http://") ||
                manifestPath.startsWith("https://")) {
                // Handle web URLs
                try {
                    const response = yield axios.get(manifestPath, {
                        responseType: "text",
                    });
                    return response.data; // Return the file content as a string
                }
                catch (error) {
                    console.error(`Failed to fetch manifest file from URL: ${manifestPath}`, error);
                    throw new Error(`Failed to fetch manifest file from URL: ${manifestPath}`);
                }
            }
            else {
                // Handle local file paths
                try {
                    return yield RNFS.readFile(manifestPath, "utf8"); // Read the file content
                }
                catch (error) {
                    console.error(`Failed to read manifest file from local path: ${manifestPath}`, error);
                    throw new Error(`Failed to read manifest file from local path: ${manifestPath}`);
                }
            }
        });
    }
}
_a = ScormService;
ScormService.launchScorm = (destinationPath) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("SCORM Destination Path:", destinationPath);
    try {
        // Find the SCORM launch file
        const launchPath = yield _a.detectScormLaunchFile(destinationPath);
        if (launchPath) {
            return {
                basePath: `${destinationPath}`,
                fileName: launchPath,
            };
        }
        // Fallback: Check for common entry files
        const commonEntryFiles = [
            "index.html",
            "launch.html",
            "default.html",
            "story.html",
        ];
        for (const file of commonEntryFiles) {
            if (yield RNFS.exists(`${destinationPath}/${file}`)) {
                return {
                    basePath: destinationPath,
                    fileName: launchPath,
                };
            }
        }
        throw new Error("Could not find a valid SCORM entry file");
    }
    catch (error) {
        console.error("Failed to load SCORM package:", error);
        throw error;
    }
});
ScormService.detectScormLaunchFile = (destinationPath) => __awaiter(void 0, void 0, void 0, function* () {
    const imsManifestPath = `${destinationPath}/imsmanifest.xml`;
    const csfManifestPath = `${destinationPath}/CSF.xml`;
    const [imsManifestExists, csfManifestExists] = yield Promise.all([
        _a.fileExists(imsManifestPath),
        _a.fileExists(csfManifestPath),
    ]);
    console.log("SCORM Manifest Check:", {
        imsManifestExists,
        csfManifestExists,
    });
    if (imsManifestExists) {
        return yield _a.findScormLaunchFile(imsManifestPath, "SCORM 1.2");
    }
    if (csfManifestExists) {
        return yield _a.findScormLaunchFile(csfManifestPath, "SCORM 1.1");
    }
    console.warn("No SCORM manifest file found.");
    return null;
});
ScormService.findScormLaunchFile = (manifestPath, scormVersion) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    try {
        console.log(`Reading ${scormVersion} manifest file:`, manifestPath);
        const xml = yield _a.readManifestFile(manifestPath);
        console.log("Parsing XML...");
        const manifest = xml2js(xml, { compact: true });
        //console.log('📜 Parsed Manifest:', JSON.stringify(manifest, null, 2));
        let launchLocation = null;
        // SCORM 1.2 (imsmanifest.xml)
        if (scormVersion === "SCORM 1.2" &&
            ((_c = (_b = manifest.manifest) === null || _b === void 0 ? void 0 : _b.resources) === null || _c === void 0 ? void 0 : _c.resource)) {
            console.log("SCORM 1.2 detected (imsmanifest.xml)");
            const resources = Array.isArray(manifest.manifest.resources.resource)
                ? manifest.manifest.resources.resource
                : [manifest.manifest.resources.resource];
            const launchResource = resources.find((res) => res._attributes && res._attributes.href);
            if (launchResource) {
                launchLocation = launchResource._attributes.href;
                console.log(launchResource._attributes.href, "launchResource._attributes.href");
            }
        }
        // SCORM 1.1 (CSF.xml)
        if (scormVersion === "SCORM 1.1" &&
            ((_g = (_f = (_e = (_d = manifest.content) === null || _d === void 0 ? void 0 : _d.block) === null || _e === void 0 ? void 0 : _e.sco) === null || _f === void 0 ? void 0 : _f.launch) === null || _g === void 0 ? void 0 : _g.location)) {
            console.log("SCORM 1.1 detected (CSF.xml)");
            const scoBlock = Array.isArray(manifest.content.block)
                ? manifest.content.block.find((b) => b.sco)
                : manifest.content.block;
            const sco = Array.isArray(scoBlock === null || scoBlock === void 0 ? void 0 : scoBlock.sco)
                ? scoBlock.sco[0]
                : scoBlock === null || scoBlock === void 0 ? void 0 : scoBlock.sco;
            if ((_h = sco === null || sco === void 0 ? void 0 : sco.launch) === null || _h === void 0 ? void 0 : _h.location) {
                launchLocation =
                    sco.launch.location._cdata || sco.launch.location._text || null;
            }
        }
        // SCORM 2004 (2nd, 3rd, 4th Edition) - imsmanifest.xml
        if (scormVersion.includes("SCORM 2004") &&
            ((_k = (_j = manifest.manifest) === null || _j === void 0 ? void 0 : _j.organizations) === null || _k === void 0 ? void 0 : _k.organization)) {
            console.log("SCORM 2004 detected (imsmanifest.xml)");
            const organizations = Array.isArray(manifest.manifest.organizations.organization)
                ? manifest.manifest.organizations.organization
                : [manifest.manifest.organizations.organization];
            for (const org of organizations) {
                if (org.item) {
                    const items = Array.isArray(org.item) ? org.item : [org.item];
                    for (const item of items) {
                        if ((_l = item._attributes) === null || _l === void 0 ? void 0 : _l.identifierref) {
                            const resource = manifest.manifest.resources.resource.find((res) => {
                                var _b;
                                return ((_b = res._attributes) === null || _b === void 0 ? void 0 : _b.identifier) ===
                                    item._attributes.identifierref;
                            });
                            if (resource && ((_m = resource._attributes) === null || _m === void 0 ? void 0 : _m.href)) {
                                launchLocation = resource._attributes.href;
                                break;
                            }
                        }
                    }
                }
                if (launchLocation)
                    break;
            }
        }
        // Fallback: Try to find a generic launch file
        if (!launchLocation && ((_p = (_o = manifest.manifest) === null || _o === void 0 ? void 0 : _o.resources) === null || _p === void 0 ? void 0 : _p.resource)) {
            console.log("🔍 Searching for generic SCORM launch file...");
            const resources = Array.isArray(manifest.manifest.resources.resource)
                ? manifest.manifest.resources.resource
                : [manifest.manifest.resources.resource];
            const launchResource = resources.find((res) => res._attributes && res._attributes.href);
            if (launchResource) {
                launchLocation = launchResource._attributes.href;
            }
        }
        if (launchLocation) {
            console.log("✅ SCORM launch file found:", launchLocation);
            return launchLocation;
        }
        console.warn("❌ No SCORM launch file found in manifest");
        return null;
    }
    catch (error) {
        console.error("❌ Error parsing SCORM manifest:", error);
        return null;
    }
});
ScormService.getScormJSBridge = (prevSCORMProgress) => `
  function injectAPIs(targetWindow) {
    targetWindow.API = {
      LMSInitialize: function() {
        // Inject all SCORM data model values into the window object
        const scormData = ${JSON.stringify(prevSCORMProgress)};
        for (const key in scormData) {
          if (scormData.hasOwnProperty(key)) {
            window[key] = scormData[key];
          }
        }

        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'LMSInitialize' }));
        return "true";
      },
      LMSFinish: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'LMSFinish' }));
        return "true";
      },
      LMSGetValue: function(parameter) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'LMSGetValue', parameter }));
        return window[parameter] || "";
      },
      LMSSetValue: function(parameter, value) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'LMSSetValue', parameter, value }));
        window[parameter] = value;
        return "true";
      },
      LMSCommit: function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({ action: 'LMSCommit' }));
        return "true";
      },
      LMSGetLastError: () => "0",
      LMSGetErrorString: () => "No error",
      LMSGetDiagnostic: () => "No diagnostic information available"
    };

    targetWindow.API_1484_11 = {
      Initialize: targetWindow.API.LMSInitialize,
      Terminate: targetWindow.API.LMSFinish,
      GetValue: targetWindow.API.LMSGetValue,
      SetValue: targetWindow.API.LMSSetValue,
      Commit: targetWindow.API.LMSCommit,
      GetLastError: targetWindow.API.LMSGetLastError,
      GetErrorString: targetWindow.API.LMSGetErrorString,
      GetDiagnostic: targetWindow.API.LMSGetDiagnostic
    };
  }

  function injectAPIsIntoIframes() {
    const iframes = document.getElementsByTagName('iframe');
    for (let i = 0; i < iframes.length; i++) {
        const iframeWindow = iframes[i].contentWindow;
        if (iframeWindow) {
          injectAPIs(iframeWindow);
        }
    }
  }

  // Inject APIs into the current window
  injectAPIs(window);

  // Inject APIs into all iframes in the current window
  injectAPIsIntoIframes();

  // Inject APIs into the opener window if it exists
  // This is a workaround for the issue where the opener window is not accessible in React Native WebView as React Native WebView does not have support for Window.opener.
  window.opener = {};
  injectAPIs(window.opener);

  true;
`;
ScormService.handleMessage = (event, API) => {
    try {
        const message = JSON.parse(event.nativeEvent.data);
        const parameter = message.parameter;
        const action = message.action;
        console.log("SCORM Event", message);
        switch (action) {
            case "LMSInitialize":
                API.LMSInitialize();
                break;
            case "LMSFinish":
                API.LMSFinish();
                break;
            case "LMSGetValue":
                API.LMSGetValue(parameter);
                break;
            case "LMSSetValue":
                API.LMSSetValue(parameter, message.value);
                break;
            case "LMSCommit":
                API.LMSCommit();
                break;
            case "LMSGetLastError":
                API.LMSGetLastError();
                break;
            case "LMSGetErrorString":
                API.LMSGetErrorString();
                break;
            case "LMSGetDiagnostic":
                API.LMSGetDiagnostic();
                break;
            default:
                console.warn("Unknown SCORM action:", message.action);
        }
    }
    catch (error) {
        console.error("Failed to handle message from WebView:", error);
    }
};
