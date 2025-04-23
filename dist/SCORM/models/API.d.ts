import { SCORMDataModel } from "./SCORMDataModel";
export interface API {
    LMSInitialize: () => void;
    LMSFinish: () => void;
    LMSGetValue: (parameter: keyof SCORMDataModel) => void;
    LMSSetValue: (parameter: keyof SCORMDataModel, value: string) => void;
    LMSCommit: () => void;
    LMSGetLastError: () => void;
    LMSGetErrorString: () => void;
    LMSGetDiagnostic: () => void;
}
