import { DirectiveContext, DirectiveHandler } from "@/types/directive.types";

export const nTextDirective: DirectiveHandler = (context: DirectiveContext): void => {
    const { element, expression, component } = context;

    const dataObject = component.data;

    if (dataObject && typeof dataObject === "object" && expression in dataObject) {
        const value = dataObject[expression];

        element.textContent = String(value);
    } else {
        element.textContent = "";
        console.warn(
            `Nihil.js (n-text): Property or expression "${expression}" not found in component data for element <${element.tagName.toLowerCase()}>. Data:`,
            dataObject,
        );
    }
};
