import { Nihil } from "./core/Nihil";

export const initializeNihil = (): void => {
    try {
        const nihilInstance = new Nihil(document.body);
        nihilInstance.init();
        console.log("Nihil.js instance created and initialized. The existential dread of JavaScript is now slightly more manageable.");
    } catch (error) {
        console.error("Nihil.js: Failed to initialize.", error);
    }
};

if (document.readyState === "loading" && typeof document != "undefined") {
    document.addEventListener("DOMContentLoaded", initializeNihil);
} else if (typeof document !== "undefined") {
    initializeNihil();
} else {
    console.warn("Nihil.js: DOM not available. Skipping initialization.");
}
