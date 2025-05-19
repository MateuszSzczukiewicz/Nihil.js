export const evaluateExpression = (
    expression: string,
    dataContext: Record<string, unknown> | null | undefined,
    // element?: HTMLElement
): unknown => {
    if (!dataContext) {
        return undefined;
    }

    const trimmedExpression = expression.trim();
    if (trimmedExpression === "") {
        return undefined;
    }

    const keys = trimmedExpression.split(".");
    let currentValue: unknown = dataContext;

    for (const key of keys) {
        if (typeof currentValue === "object" && currentValue !== null && Object.prototype.hasOwnProperty.call(currentValue, key)) {
            currentValue = (currentValue as Record<string, unknown>)[key];
        } else {
            return undefined;
        }
    }
    return currentValue;
};
