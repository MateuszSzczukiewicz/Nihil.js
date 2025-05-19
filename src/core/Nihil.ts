import { NihilDataObjectSchema } from "@/schemas/component.schemas";
import type { NihilComponent, NihilComponentData } from "@/types/component.types";
import type { DirectiveContext, DirectiveHandler } from "@/types/directive.types";
import { directives as registeredDirectives } from "@/directives";
import { makeReactive } from "@/core/reactivity";

const DIRECTIVE_PREFIX = "n-";
const INITIALIZED_ATTR = "initialData-nihil-initialized";

export class Nihil {
    protected rootElement: HTMLElement;

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
    }

    public init(): void {
        this.discoverAndInitializeComponents(this.rootElement);
    }

    protected discoverAndInitializeComponents(element: HTMLElement): void {
        if (element.hasAttribute(`${DIRECTIVE_PREFIX}initialData`) && !element.hasAttribute(INITIALIZED_ATTR)) {
            const component = this.initializeComponent(element);
            if (component) {
                this.scanElementForDirectives(component.element, component);
                Array.from(component.element.children).forEach((childEl) => {
                    if (childEl instanceof HTMLElement) {
                        this.discoverAndInitializeComponentsAndScanDirectives(childEl, component);
                    }
                });
            }
        } else if (!element.hasAttribute(INITIALIZED_ATTR)) {
            Array.from(element.children).forEach((child) => {
                if (child instanceof HTMLElement) {
                    this.discoverAndInitializeComponents(child);
                }
            });
        }
    }

    protected discoverAndInitializeComponentsAndScanDirectives(element: HTMLElement, parentComponentContext: NihilComponent): void {
        if (element.hasAttribute(`${DIRECTIVE_PREFIX}initialData`) && !element.hasAttribute(INITIALIZED_ATTR)) {
            const nestedComponent = this.initializeComponent(element);
            if (nestedComponent) {
                this.scanElementForDirectives(nestedComponent.element, nestedComponent);
                Array.from(nestedComponent.element.children).forEach((childEl) => {
                    if (childEl instanceof HTMLElement) {
                        this.discoverAndInitializeComponentsAndScanDirectives(childEl, nestedComponent);
                    }
                });
            }
        } else if (!element.hasAttribute(INITIALIZED_ATTR)) {
            this.scanElementForDirectives(element, parentComponentContext);
            Array.from(element.children).forEach((childEl) => {
                if (childEl instanceof HTMLElement) {
                    this.discoverAndInitializeComponentsAndScanDirectives(childEl, parentComponentContext);
                }
            });
        }
    }

    protected initializeComponent(element: HTMLElement): NihilComponent | undefined {
        element.setAttribute(INITIALIZED_ATTR, "true");

        const dataString = element.getAttribute(`${DIRECTIVE_PREFIX}initialData`);

        if (dataString === null || dataString.trim() === "") {
            console.warn(
                `Nihil.js: Element <${element.tagName.toLowerCase()}> has [${DIRECTIVE_PREFIX}initialData] attribute that is missing or empty. Skipping component initialData initialization.`,
                element,
            );
            return undefined;
        }
        try {
            const evaluationContext: Record<string, unknown> = {
                $el: element,
            };

            type EvaluatorFunction = (context: Record<string, unknown>) => unknown;

            const dataFunc = new Function("context", `with (context) { return (${dataString}) }`) as EvaluatorFunction;

            const evaluatedData: unknown = dataFunc(evaluationContext);

            const validationResult = NihilDataObjectSchema.safeParse(evaluatedData);

            if (validationResult.success) {
                const initialData: NihilComponentData = validationResult.data;

                const component: NihilComponent = { element, data: initialData };

                const handleDataUpdate = <P extends keyof NihilComponentData>(
                    target: NihilComponentData,
                    property: P,
                    value: NihilComponentData[P],
                    oldValue: NihilComponentData[P] | undefined,
                ) => {
                    console.log(target, property, value, oldValue);
                    this.updateComponentView(component);
                };

                component.data = makeReactive(initialData, handleDataUpdate);

                return component;
            } else {
                console.error(
                    `Nihil.js: Evaluated [${DIRECTIVE_PREFIX}initialData] expression on element <${element.tagName.toLowerCase()}> did not result in a valid initialData object.`,
                    {
                        attributeValue: dataString,
                        evaluatedValue: evaluatedData,
                        validationErrors: validationResult.error.format(),
                    },
                    element,
                );
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(
                `Nihil.js: Failed to evaluate [${DIRECTIVE_PREFIX}initialData] expression on element <${element.tagName.toLowerCase()}>. Check for syntax errors.`,
                {
                    attributeValue: dataString,
                    error: errorMessage,
                    originalError: error,
                },
                element,
            );
        }
        return undefined;
    }

    protected updateComponentView(component: NihilComponent): void {
        this.scanElementForDirectives(component.element, component);
        Array.from(component.element.children).forEach((childEl) => {
            if (childEl instanceof HTMLElement) {
                this.discoverAndInitializeComponentsAndScanDirectives(childEl, component);
            }
        });
    }

    protected scanElementForDirectives(element: HTMLElement, componentContext: NihilComponent): void {
        Array.from(element.attributes).forEach((attr) => {
            if (attr.name.startsWith(DIRECTIVE_PREFIX) && attr.name !== `${DIRECTIVE_PREFIX}initialData`) {
                this.processDirective(element, attr.name, attr.value, componentContext);
            }
        });
    }

    protected processDirective(element: HTMLElement, attrName: string, attrValue: string, componentContext: NihilComponent): void {
        const [nameAndArg, ...modifierStrings] = attrName.substring(DIRECTIVE_PREFIX.length).split(".");
        const [directiveBaseName, directiveArgument] = nameAndArg.split(":");

        const handler: DirectiveHandler | undefined = registeredDirectives[directiveBaseName];

        if (handler) {
            const context: DirectiveContext = {
                element,
                attributeName: attrName,
                directiveName: directiveBaseName,
                directiveArgument,
                directiveModifiers: modifierStrings,
                expression: attrValue,
                component: componentContext,
                nihilInstance: this,
            };
            try {
                const cleanup = handler(context);
                if (typeof cleanup === "function") {
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`Nihil.js: Error processing directive [${attrName}] on element <${element.tagName.toLowerCase()}>.`, {
                    error: errorMessage,
                    originalError: error,
                    contextUsed: context,
                });
            }
        } else {
            console.warn(`Nihil.js: Unknown directive [${attrName}] on element <${element.tagName.toLowerCase()}>.`);
        }
    }
}
