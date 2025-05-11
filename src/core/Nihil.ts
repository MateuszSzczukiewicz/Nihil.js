export class Nihil {
    private rootElement: HTMLElement;

    constructor(rootElement: HTMLElement | string = document.body) {
        if (typeof rootElement === "string") {
            const element = document.querySelector<HTMLElement>(rootElement);
            if (!element) {
                throw new Error(
                    `Nihil.js: Root element selector "${rootElement}" did not match any element. Ensure the element exists or the DOM is ready.`,
                );
            }
            this.rootElement = element;
        } else {
            this.rootElement = rootElement;
        }

        console.log("Nihil.js initialized.");
    }

    public init(): void {
        console.log("Nihil.js: Scanning the DOM.");
        this.scanDOM(this.rootElement);
    }

    private scanDOM(element: HTMLElement): void {
        console.log(
            `Nihil.js: Scanning element <${element.tagName.toLowerCase()}> for directives.`, // <-- ZAKTUALIZOWANA LINIA
        );

        const elementsWithMyData = Array.from(element.querySelectorAll<HTMLElement>("[my-data]"));

        if (element.hasAttribute("my-data")) {
            elementsWithMyData.unshift(element);
        }

        elementsWithMyData.forEach((el) => {
            console.log(
                `Nihil.js: Found potential component with [my-data]:`, // <-- ZAKTUALIZOWANA LINIA
                el,
            );
        });

        // Array.from(element.children).forEach((child) => {
        //     if (child instanceof HTMLElement) {
        //         this.scanDOM(child);
        //     }
        // });
    }
}

export interface NihilComponent {
    element: HTMLElement;
    data: Record<string, unknown>;
}
