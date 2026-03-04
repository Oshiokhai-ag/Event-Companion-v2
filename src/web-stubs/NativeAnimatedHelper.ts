// src/web-stubs/NativeAnimatedHelper.ts
export const API = {
  createAnimatedNode: () => {},
  startListeningToAnimatedNodeValue: () => {},
  stopListeningToAnimatedNodeValue: () => {},
  connectAnimatedNodes: () => {},
  disconnectAnimatedNodes: () => {},
  startAnimatingNode: () => {},
  stopAnimation: () => {},
  setAnimatedNodeValue: () => {},
  setAnimatedNodeOffset: () => {},
  flattenAnimatedNodeOffset: () => {},
  extractAnimatedNodeOffset: () => {},
  connectAnimatedNodeToView: () => {},
  disconnectAnimatedNodeFromView: () => {},
  dropAnimatedNode: () => {},
  addAnimatedEventToView: () => {},
  removeAnimatedEventFromView: () => {},
};
export const assertNativeAnimatedModule = () => {};
export const shouldUseNativeDriver = () => false;
export default { API, assertNativeAnimatedModule, shouldUseNativeDriver };
