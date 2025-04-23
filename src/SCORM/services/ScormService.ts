import { Alert } from "react-native";
import {
  WebViewEvent,
  WebViewMessageEvent,
} from "react-native-webview/lib/WebViewTypes";
import { API } from "../models/API";
import RNFS from "react-native-fs";
import { xml2js } from "xml-js";

import axios from "axios";
import { SCORMDataModel } from "../models/SCORMDataModel";

export class ScormService {
  private static async fileExists(path: string): Promise<boolean> {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      // Handle web URLs
      try {
        const response = await axios.head(path); // Use HEAD request to check file existence
        return response.status === 200;
      } catch (error) {
        console.warn(`File does not exist at URL: ${path}`, error);
        return false;
      }
    } else {
      // Handle local file paths
      return RNFS.exists(path);
    }
  }

  private static async readManifestFile(manifestPath: string): Promise<string> {
    if (
      manifestPath.startsWith("http://") ||
      manifestPath.startsWith("https://")
    ) {
      // Handle web URLs
      try {
        const response = await axios.get(manifestPath, {
          responseType: "text",
        });
        return response.data; // Return the file content as a string
      } catch (error) {
        console.error(
          `Failed to fetch manifest file from URL: ${manifestPath}`,
          error
        );
        throw new Error(
          `Failed to fetch manifest file from URL: ${manifestPath}`
        );
      }
    } else {
      // Handle local file paths
      try {
        return await RNFS.readFile(manifestPath, "utf8"); // Read the file content
      } catch (error) {
        console.error(
          `Failed to read manifest file from local path: ${manifestPath}`,
          error
        );
        throw new Error(
          `Failed to read manifest file from local path: ${manifestPath}`
        );
      }
    }
  }

  static launchScorm = async (destinationPath: string) => {
    console.log("SCORM Destination Path:", destinationPath);

    try {
      // Find the SCORM launch file
      const launchPath = await ScormService.detectScormLaunchFile(
        destinationPath
      );
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
        if (await RNFS.exists(`${destinationPath}/${file}`)) {
          return {
            basePath: destinationPath,
            fileName: launchPath,
          };
        }
      }

      throw new Error("Could not find a valid SCORM entry file");
    } catch (error) {
      console.error("Failed to load SCORM package:", error);
      throw error;
    }
  };

  private static detectScormLaunchFile = async (
    destinationPath: string
  ): Promise<string | null> => {
    const imsManifestPath = `${destinationPath}/imsmanifest.xml`;
    const csfManifestPath = `${destinationPath}/CSF.xml`;

    const [imsManifestExists, csfManifestExists] = await Promise.all([
      ScormService.fileExists(imsManifestPath),
      ScormService.fileExists(csfManifestPath),
    ]);

    console.log("SCORM Manifest Check:", {
      imsManifestExists,
      csfManifestExists,
    });

    if (imsManifestExists) {
      return await ScormService.findScormLaunchFile(
        imsManifestPath,
        "SCORM 1.2"
      );
    }
    if (csfManifestExists) {
      return await ScormService.findScormLaunchFile(
        csfManifestPath,
        "SCORM 1.1"
      );
    }

    console.warn("No SCORM manifest file found.");
    return null;
  };

  private static findScormLaunchFile = async (
    manifestPath: string,
    scormVersion: string
  ): Promise<string | null> => {
    try {
      console.log(`Reading ${scormVersion} manifest file:`, manifestPath);
      const xml = await ScormService.readManifestFile(manifestPath);

      console.log("Parsing XML...");
      const manifest: any = xml2js(xml, { compact: true });
      //console.log('📜 Parsed Manifest:', JSON.stringify(manifest, null, 2));

      let launchLocation: string | null = null;

      // SCORM 1.2 (imsmanifest.xml)
      if (
        scormVersion === "SCORM 1.2" &&
        manifest.manifest?.resources?.resource
      ) {
        console.log("SCORM 1.2 detected (imsmanifest.xml)");
        const resources = Array.isArray(manifest.manifest.resources.resource)
          ? manifest.manifest.resources.resource
          : [manifest.manifest.resources.resource];

        const launchResource = resources.find(
          (res: any) => res._attributes && res._attributes.href
        );

        if (launchResource) {
          launchLocation = launchResource._attributes.href;
          console.log(
            launchResource._attributes.href,
            "launchResource._attributes.href"
          );
        }
      }

      // SCORM 1.1 (CSF.xml)
      if (
        scormVersion === "SCORM 1.1" &&
        manifest.content?.block?.sco?.launch?.location
      ) {
        console.log("SCORM 1.1 detected (CSF.xml)");

        const scoBlock = Array.isArray(manifest.content.block)
          ? manifest.content.block.find((b: { sco: any }) => b.sco)
          : manifest.content.block;

        const sco = Array.isArray(scoBlock?.sco)
          ? scoBlock.sco[0]
          : scoBlock?.sco;

        if (sco?.launch?.location) {
          launchLocation =
            sco.launch.location._cdata || sco.launch.location._text || null;
        }
      }

      // SCORM 2004 (2nd, 3rd, 4th Edition) - imsmanifest.xml
      if (
        scormVersion.includes("SCORM 2004") &&
        manifest.manifest?.organizations?.organization
      ) {
        console.log("SCORM 2004 detected (imsmanifest.xml)");
        const organizations = Array.isArray(
          manifest.manifest.organizations.organization
        )
          ? manifest.manifest.organizations.organization
          : [manifest.manifest.organizations.organization];

        for (const org of organizations) {
          if (org.item) {
            const items = Array.isArray(org.item) ? org.item : [org.item];

            for (const item of items) {
              if (item._attributes?.identifierref) {
                const resource = manifest.manifest.resources.resource.find(
                  (res: any) =>
                    res._attributes?.identifier ===
                    item._attributes.identifierref
                );

                if (resource && resource._attributes?.href) {
                  launchLocation = resource._attributes.href;
                  break;
                }
              }
            }
          }
          if (launchLocation) break;
        }
      }

      // Fallback: Try to find a generic launch file
      if (!launchLocation && manifest.manifest?.resources?.resource) {
        console.log("🔍 Searching for generic SCORM launch file...");
        const resources = Array.isArray(manifest.manifest.resources.resource)
          ? manifest.manifest.resources.resource
          : [manifest.manifest.resources.resource];

        const launchResource = resources.find(
          (res: any) => res._attributes && res._attributes.href
        );

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
    } catch (error) {
      console.error("❌ Error parsing SCORM manifest:", error);
      return null;
    }
  };

  static getScormJSBridge = (prevSCORMProgress: SCORMDataModel) => `
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

  static handleMessage = (event: WebViewMessageEvent, API: API) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      const parameter: keyof SCORMDataModel = message.parameter;

      const action: keyof API = message.action;
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
    } catch (error) {
      console.error("Failed to handle message from WebView:", error);
    }
  };
}
