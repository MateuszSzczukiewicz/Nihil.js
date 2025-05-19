import { DirectiveContext, DirectiveHandler } from "@/types/directive.types";
import { evaluateExpression } from "@/utils/evaluator";

export const nTextDirective: DirectiveHandler = (context: DirectiveContext): void => {
    const { element, expression, component } = context;

    const updateText = () => {
        try {
            const value: unknown = evaluateExpression(expression, component.data);
            let displayText = "";

            if (value === null || value === undefined) {
                displayText = "";
            } else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
                displayText = String(value);
            } else {
                displayText = "";
                console.warn(
                    `Nihil.js (n-text): Expression "${expression}" on element <${element.tagName.toLowerCase()}> resolved to a non-primitive value (e.g., object, array). Displaying an empty string. Consider accessing a specific property or using a different directive. Value:`,
                    value,
                );
                element.textContent = displayText;
            }
        } catch (error) {
            console.error(`Nihil.js (n-text): Error evaluating expression "${expression}" for element <${element.tagName.toLowerCase()}>.`, error);
            element.textContent = "";
        }
    };

    updateText();
};
