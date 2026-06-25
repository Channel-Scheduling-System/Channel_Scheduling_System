export function assertNever(value: never): never {
    throw new Error(`Unhandled notification event: ${JSON.stringify(value)}`);
}
