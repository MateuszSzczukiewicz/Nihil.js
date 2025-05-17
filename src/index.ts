import { Nihil } from "@/core/Nihil";

export const initializeNihil = (rootElementOrSelector: HTMLElement | string = document.body): Nihil | undefined => {
    try {
        const nihilInstance = new Nihil(rootElementOrSelector);
        nihilInstance.init();
        window.NihilJsInstance = nihilInstance;
        console.log("Nihil.js instance created and initialized. The existential dread of JavaScript is now slightly more manageable.");
    } catch (error) {
        console.error("Nihil.js: Failed to initialize.", error);
        return undefined;
    }
};

if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => initializeNihil());
    } else {
        initializeNihil();
    }
} else {
    console.warn("Nihil.js: DOM not available. Skipping initialization.");
}

export { Nihil };
