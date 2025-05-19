function getComponentData() {
    console.log("Nihil.js Example: getComponentData() was called.");
    return {
        source: "Function Call",
        timestamp: Date.now(),
        active: true,
        nested: {
            value: "Nested Value from Function",
        },
    };
}
