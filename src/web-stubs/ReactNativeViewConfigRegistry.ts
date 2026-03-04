// src/web-stubs/ReactNativeViewConfigRegistry.ts
export const customBubblingEventTypes: Record<string, unknown> = {};
export const customDirectEventTypes: Record<string, unknown> = {};
export const eventTypes: Record<string, unknown> = {};
export const register = () => {};
export const registerLazy = () => {};
export const get = () => ({});
export const has = () => false;
const registry = { customBubblingEventTypes, customDirectEventTypes, eventTypes, register, registerLazy, get, has };
export default registry;
