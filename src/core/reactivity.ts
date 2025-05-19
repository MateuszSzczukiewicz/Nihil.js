export type ReactiveUpdateCallback<T extends object, P extends keyof T> = (target: T, property: P, value: T[P], oldValue: T[P] | undefined) => void;

export const makeReactive = <T extends object>(
    target: T,
    onUpdate: <P extends keyof T>(target: T, property: P, value: T[P], oldValue: T[P] | undefined) => void,
): T => {
    return new Proxy(target, {
        get(targetObject: T, propertyKey: string | symbol, receiver: unknown): unknown {
            return Reflect.get(targetObject, propertyKey, receiver);
        },

        set(targetObject: T, propertyKey: string | symbol, value: unknown, receiver: unknown): boolean {
            const isKnownKey = Object.prototype.hasOwnProperty.call(targetObject, propertyKey);

            let oldValue: unknown;

            if (isKnownKey) {
                oldValue = Reflect.get(targetObject, propertyKey, receiver);
            } else {
                oldValue = undefined;
            }

            if (Object.is(oldValue, value) && isKnownKey) {
                return true;
            }

            const success = Reflect.set(targetObject, propertyKey, value, receiver);
            if (success && isKnownKey) {
                onUpdate(targetObject, propertyKey as keyof T, value as T[keyof T], oldValue as T[keyof T] | undefined);
            }

            return success;
        },
    });
};
