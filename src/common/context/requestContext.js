import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage();

export const runWithContext = (context, callback) => storage.run(context, callback);

export const getContext = () => storage.getStore() || {};

export const setContext = (patch) => {
  const store = storage.getStore();
  if (store) Object.assign(store, patch);
  return store;
};

export default { runWithContext, getContext, setContext };
