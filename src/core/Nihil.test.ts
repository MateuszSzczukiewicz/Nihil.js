import { Nihil } from "./Nihil";
import type { NihilComponent } from "@/types/component.types";

type NihilProtectedMembers = Nihil & {
    rootElement: HTMLElement;
    discoverAndInitializeComponents: (element: HTMLElement) => void;
    discoverAndInitializeComponentsAndScanDirectives: (element: HTMLElement, parentComponentContext: NihilComponent) => void;
    initializeComponent: (element: HTMLElement) => NihilComponent | undefined;
    scanElementForDirectives: (element: HTMLElement, componentContext: NihilComponent) => void;
    processDirective: (element: HTMLElement, attrName: string, attrValue: string, componentContext: NihilComponent) => void;
};

describe("Nihil Core Class", () => {
    let rootElement: HTMLElement;
    let nihilInstance: NihilProtectedMembers;

    beforeEach(() => {
        document.body.innerHTML = '<div id="test-root-nihil"></div>';
        const el = document.getElementById("test-root-nihil");
        if (!el) {
            throw new Error("Test setup failed: Root element #test-root-nihil not found in DOM.");
        }
        rootElement = el;
        nihilInstance = new Nihil(rootElement) as NihilProtectedMembers;
    });

    afterEach(() => {
        document.body.innerHTML = "";
        jest.restoreAllMocks();
    });

    describe("Constructor and Initialization", () => {
        it("should initialize without errors when a valid root HTMLElement is provided", () => {
            expect(() => new Nihil(rootElement)).not.toThrow();
        });

        it("should initialize with document.body by default if no root element is provided", () => {
            const instance = new Nihil() as NihilProtectedMembers;
            expect(instance.rootElement).toBe(document.body);
        });

        it("should throw an error if the string selector for the root element does not match any existing element", () => {
            const selector = "#non-existent-nihil-element";
            expect(() => new Nihil(selector)).toThrow(
                `Nihil.js: Root element selector "${selector}" did not match any element. Ensure the element exists or the DOM is ready.`,
            );
        });

        it("should call discoverAndInitializeComponents with the root element when init() is invoked", () => {
            const discoverSpy = jest.spyOn(nihilInstance, "discoverAndInitializeComponents");
            nihilInstance.init();
            expect(discoverSpy).toHaveBeenCalledTimes(1);
            expect(discoverSpy).toHaveBeenCalledWith(nihilInstance.rootElement);
        });
    });

    describe("discoverAndInitializeComponents method", () => {
        it("should call initializeComponent for an element with n-data and no initialized attribute", () => {
            rootElement.innerHTML = `<div n-data="{}"></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const initializeSpy = jest.spyOn(nihilInstance, "initializeComponent");
            const scanDirectivesSpy = jest.spyOn(nihilInstance, "scanElementForDirectives");

            nihilInstance.discoverAndInitializeComponents(rootElement);

            expect(initializeSpy).toHaveBeenCalledWith(componentEl);
            expect(initializeSpy).toHaveBeenCalledTimes(1);
            expect(scanDirectivesSpy).toHaveBeenCalledWith(componentEl, expect.objectContaining({ element: componentEl }));
        });

        it("should recursively call itself for children if the current element is not a new component", () => {
            rootElement.innerHTML = `
        <div>
          <span n-data="{}"></span>
        </div>`;
            const childDiv = rootElement.firstChild as HTMLElement;
            const childSpan = childDiv.firstChild as HTMLElement;

            const discoverSpy = jest.spyOn(nihilInstance, "discoverAndInitializeComponents");
            const initializeSpy = jest.spyOn(nihilInstance, "initializeComponent");

            nihilInstance.discoverAndInitializeComponents(rootElement);

            expect(discoverSpy).toHaveBeenCalledWith(rootElement);
            expect(discoverSpy).toHaveBeenCalledWith(childDiv);
            expect(initializeSpy).toHaveBeenCalledWith(childSpan);
            expect(initializeSpy).toHaveBeenCalledTimes(1);
        });

        it("should not call initializeComponent for an element already marked as initialized", () => {
            rootElement.innerHTML = `<div n-data="{}" data-nihil-initialized="true"></div>`;
            const initializeSpy = jest.spyOn(nihilInstance, "initializeComponent");

            nihilInstance.discoverAndInitializeComponents(rootElement);

            expect(initializeSpy).not.toHaveBeenCalled();
        });

        it("should scan children of an initialized component using discoverAndInitializeComponentsAndScanDirectives", () => {
            rootElement.innerHTML = `<div n-data="{}"><span id="child-span"></span></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const childSpan = componentEl.firstChild as HTMLElement;

            // Mock initializeComponent, aby zwrócił poprawny obiekt komponentu
            jest.spyOn(nihilInstance, "initializeComponent").mockReturnValue({
                element: componentEl,
                data: {},
            });
            const discoverAndScanSpy = jest.spyOn(nihilInstance, "discoverAndInitializeComponentsAndScanDirectives");

            nihilInstance.discoverAndInitializeComponents(rootElement);

            expect(discoverAndScanSpy).toHaveBeenCalledWith(childSpan, expect.objectContaining({ element: componentEl }));
        });
    });

    describe("initializeComponent method", () => {
        it("should set ${INITIALIZED_ATTR} attribute on the element", () => {
            rootElement.innerHTML = `<div n-data="{}"></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            nihilInstance.initializeComponent(componentEl);
            expect(componentEl.hasAttribute("data-nihil-initialized")).toBe(true);
        });

        it("should warn and return undefined if n-data attribute is missing or empty", () => {
            rootElement.innerHTML = `<div n-data></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

            const result = nihilInstance.initializeComponent(componentEl);

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("has [n-data] attribute that is missing or empty"), componentEl);
            expect(result).toBeUndefined();
        });

        it("should correctly evaluate a valid JS expression from n-data and return component object", () => {
            rootElement.innerHTML = `<div n-data="{ open: true, message: 'Hello', count: 5 * 2 }"></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
            consoleLogSpy.mockClear();

            const component = nihilInstance.initializeComponent(componentEl);

            expect(component).toBeDefined();
            expect(component?.element).toBe(componentEl);
            expect(component?.data).toEqual({
                open: true,
                message: "Hello",
                count: 10,
            });
            expect(consoleLogSpy).toHaveBeenCalledWith("Nihil.js: Initialized component with evaluated data:", component);
        });

        it("should log an error and return undefined if n-data expression has a JavaScript syntax error", () => {
            rootElement.innerHTML = `<div n-data="{ open: true, message: 'unterminated }"></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const result = nihilInstance.initializeComponent(componentEl);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to evaluate [n-data] expression"),
                expect.objectContaining({
                    attributeValue: "{ open: true, message: 'unterminated }",
                    error: expect.stringContaining("SyntaxError") as HTMLElement,
                }),
                componentEl,
            );
            expect(result).toBeUndefined();
        });

        it("should log an error and return undefined if evaluated n-data is not a valid object for Zod schema", () => {
            rootElement.innerHTML = `<div n-data="'not_an_object'"></div>`;
            const componentEl = rootElement.firstChild as HTMLElement;
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

            const result = nihilInstance.initializeComponent(componentEl);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining("did not result in a valid data object"),
                expect.objectContaining({
                    attributeValue: "'not_an_object'",
                    evaluatedValue: "not_an_object",
                    validationErrors: expect.anything() as HTMLElement,
                }),
                componentEl,
            );
            expect(result).toBeUndefined();
        });
    });

    describe("scanElementForDirectives and processDirective methods", () => {
        let mockComponent: NihilComponent;

        beforeEach(() => {
            rootElement.innerHTML = `<div n-data="{}"></div>`;
            const el = rootElement.firstChild as HTMLElement;
            mockComponent = { element: el, data: { value: "test" } };
        });

        it("should call processDirective for attributes starting with n- (excluding n-data)", () => {
            mockComponent.element.setAttribute("n-text", "value");
            mockComponent.element.setAttribute("n-other", "test");
            const processDirectiveSpy = jest.spyOn(nihilInstance, "processDirective");

            nihilInstance.scanElementForDirectives(mockComponent.element, mockComponent);

            expect(processDirectiveSpy).toHaveBeenCalledWith(mockComponent.element, "n-text", "value", mockComponent);
            expect(processDirectiveSpy).toHaveBeenCalledWith(mockComponent.element, "n-other", "test", mockComponent);
            expect(processDirectiveSpy).toHaveBeenCalledTimes(2);
        });

        it("processDirective should warn for an unknown directive", () => {
            const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
            nihilInstance.processDirective(mockComponent.element, "n-unknown", "someValue", mockComponent);

            expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining("Unknown directive [n-unknown]"));
        });
    });
});
