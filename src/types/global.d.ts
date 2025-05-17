import { Nihil } from "../core/Nihil";

declare global {
    interface Window {
        NihilJsInstance?: Nihil;
    }
}

export {};
