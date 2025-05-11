import { Nihil } from "./Nihil";

type NihilProtectedMembers = {
    rootElement: HTMLElement;
    scanDOM: (element: HTMLElement) => void;
};

describe("Nihil Core Class", () => {
    let rootElement: HTMLElement;

    beforeEach(() => {
        document.body.innerHTML = '<div id="test-root-nihil"></div>';
        const el = document.getElementById("test-root-nihil");
        if (!el) {
            throw new Error("Test setup failed: Root element #test-root-nihil not found in DOM.");
        }
        rootElement = el;
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.restoreAllMocks();
    });

    it("should initialize without errors when a valid root HTMLElement is provided", () => {
        expect(() => new Nihil(rootElement)).not.toThrow();
    });

    it("should initialize with document.body by default if no root element is provided", () => {
        expect(() => new Nihil()).not.toThrow();
        const nihil = new Nihil();
        expect((nihil as unknown as NihilProtectedMembers).rootElement).toBe(document.body);
    });

    it("should throw an error if the string selector for the root element does not match any existing element", () => {
        const selector = "#non-existent-nihil-element";
        expect(() => new Nihil(selector)).toThrow(
            `Nihil.js: Root element selector "${selector}" did not match any element. Ensure the element exists or the DOM is ready.`,
        );
    });

    it("should call the scanDOM method with the root element when init() is invoked", () => {
        const nihil = new Nihil(rootElement);
        const scanDOMSpy = jest.spyOn(nihil as unknown as NihilProtectedMembers, "scanDOM");

        nihil.init();

        expect(scanDOMSpy).toHaveBeenCalledTimes(1);
        expect(scanDOMSpy).toHaveBeenCalledWith(rootElement);
    });

    describe("scanDOM method (initial behavior - assuming it's protected)", () => {
        it("should log a scanning message for the provided element", () => {
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            const nihil = new Nihil(rootElement);

            consoleSpy.mockClear();

            (nihil as unknown as NihilProtectedMembers).scanDOM(rootElement);

            expect(consoleSpy).toHaveBeenCalledTimes(1);
            expect(consoleSpy).toHaveBeenCalledWith(`Nihil.js: Scanning element <${rootElement.tagName.toLowerCase()}> for directives.`);
        });

        it("should find and log elements with the [my-data] attribute within the scanned scope", () => {
            rootElement.innerHTML = `
        <div my-data="{ msg: 'one' }"></div>
        <div>
          <span my-data="{ msg: 'two' }"></span>
        </div>
        <div my-other-attr></div>
      `;
            const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            const nihil = new Nihil(rootElement);

            consoleSpy.mockClear();

            (nihil as unknown as NihilProtectedMembers).scanDOM(rootElement);

            const divWithMessageOne = rootElement.querySelector("div[my-data=\"{ msg: 'one' }\"]");
            const spanWithMessageTwo = rootElement.querySelector("span[my-data=\"{ msg: 'two' }\"]");

            expect(consoleSpy).toHaveBeenCalledWith(`Nihil.js: Scanning element <${rootElement.tagName.toLowerCase()}> for directives.`);
            expect(consoleSpy).toHaveBeenCalledWith("Nihil.js: Found potential component with [my-data]:", divWithMessageOne);
            expect(consoleSpy).toHaveBeenCalledWith("Nihil.js: Found potential component with [my-data]:", spanWithMessageTwo);
            expect(consoleSpy).toHaveBeenCalledTimes(3);
        });
    });
});
