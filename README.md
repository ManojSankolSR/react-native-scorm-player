# react-native-scorm-player

`react-native-scorm-player` is a React Native library for integrating SCORM-compliant e-learning content into your mobile applications. It provides a WebView-based SCORM player with support for SCORM 1.1, SCORM 1.2, and SCORM 2004 standards.

## Features

- SCORM 1.1, SCORM 1.2, and SCORM 2004 support
- WebView-based SCORM player
- Handles SCORM API calls (LMSInitialize, LMSFinish, LMSGetValue, LMSSetValue, etc.)
- Injects SCORM JavaScript bridge for seamless communication
- Supports both local and remote SCORM packages

## Installation

Install the package using npm or yarn:

```bash
npm install react-native-scorm-player
```

or

```bash
yarn add react-native-scorm-player
```

## Usage

Here is an example of how to use the `ScormPlayer` component:

```tsx
import React, { useRef } from "react";
import { View } from "react-native";
import ScormPlayer, { SCORMDataModel, API } from "react-native-scorm-player";
import WebView from "react-native-webview";

const App = () => {
  const webViewRef = useRef<WebView | null>(null);

  const scormAPI: API = {
    LMSInitialize: () => console.log("LMSInitialize called"),
    LMSFinish: () => console.log("LMSFinish called"),
    LMSGetValue: (parameter) =>
      console.log("LMSGetValue called with", parameter),
    LMSSetValue: (parameter, value) =>
      console.log("LMSSetValue called with", parameter, value),
    LMSCommit: () => console.log("LMSCommit called"),
    LMSGetLastError: () => console.log("LMSGetLastError called"),
    LMSGetErrorString: () => console.log("LMSGetErrorString called"),
    LMSGetDiagnostic: () => console.log("LMSGetDiagnostic called"),
  };

  const prevSCORMProgress: SCORMDataModel = {
    "cmi.core.student_id": "12345",
    "cmi.core.student_name": "John Doe",
  };

  return (
    <View style={{ flex: 1 }}>
      <ScormPlayer
        scormUrl="https://example.com/path-to-scorm-package"
        webViewRef={webViewRef}
        API={scormAPI}
        prevSCORMProgress={prevSCORMProgress}
      />
    </View>
  );
};

export default App;
```

## API

### `ScormPlayer`

#### Props

| Prop                | Type              | Description                       |
| ------------------- | ----------------- | --------------------------------- |
| `scormUrl`          | `string`          | URL or path to the SCORM package  |
| `webViewRef`        | `React.RefObject` | Reference to the WebView instance |
| `API`               | `API`             | SCORM API implementation          |
| `prevSCORMProgress` | `SCORMDataModel`  | Previous SCORM progress data      |
| `...webViewProps`   | `WebViewProps`    | Additional props for the WebView  |

### `API`

The `API` interface defines the SCORM API methods:

- `LMSInitialize`: Initializes the SCORM session
- `LMSFinish`: Ends the SCORM session
- `LMSGetValue`: Retrieves a SCORM data model value
- `LMSSetValue`: Sets a SCORM data model value
- `LMSCommit`: Commits the SCORM data
- `LMSGetLastError`: Retrieves the last error code
- `LMSGetErrorString`: Retrieves the error string for a given error code
- `LMSGetDiagnostic`: Retrieves diagnostic information

### Note on SCORM 2004 Methods

The `API` interface provided in this library is designed to support SCORM 1.2 and SCORM 2004. However, the method names in SCORM 2004 differ slightly from SCORM 1.2. For example, SCORM 2004 methods are as follows:

- `Initialize("") : bool` – Begins a communication session with the LMS.
- `Terminate("") : bool` – Ends a communication session with the LMS.
- `GetValue(element : CMIElement) : string` – Retrieves a value from the LMS.
- `SetValue(element : CMIElement, value : string) : string` – Saves a value to the LMS.
- `Commit("") : bool` – Indicates to the LMS that all data should be persisted (not required).
- `GetLastError() : CMIErrorCode` – Returns the error code that resulted from the last API call.
- `GetErrorString(errorCode : CMIErrorCode) : string` – Returns a short string describing the specified error code.
- `GetDiagnostic(errorCode : CMIErrorCode) : string` – Returns detailed information about the last error that occurred.

In this library, the SCORM 2004 methods are mapped to their SCORM 1.2 equivalents for simplicity. For example:

- `Initialize` is mapped to `LMSInitialize`
- `Terminate` is mapped to `LMSFinish`
- `GetValue` is mapped to `LMSGetValue`
- `SetValue` is mapped to `LMSSetValue`
- `Commit` is mapped to `LMSCommit`
- `GetLastError` is mapped to `LMSGetLastError`
- `GetErrorString` is mapped to `LMSGetErrorString`
- `GetDiagnostic` is mapped to `LMSGetDiagnostic`

This mapping ensures compatibility with both SCORM 1.2 and SCORM 2004, but users should be aware of these differences to avoid confusion.

### `SCORMDataModel`

The `SCORMDataModel` interface defines the SCORM data model elements, such as `cmi.core.student_id`, `cmi.core.lesson_status`, and more.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
