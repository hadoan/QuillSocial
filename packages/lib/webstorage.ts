/**
 * Provides a wrapper around localStorage to avoid errors in case of restricted storage quillsocial.
 *
 * TODO: In case of an embed if localStorage is not available(third party), use localStorage of parent(first party) that contains the iframe.
 */
export const localStorage = {
  getItem(key: string) {
    try {
      // eslint-disable-next-line @quillsocial/eslint/avoid-web-storage
      return window.localStorage.getItem(key);
    } catch (e) {
      // In case storage is restricted. Possible reasons
      // 1. Third Party Context in Chrome Incognito mode.
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      // eslint-disable-next-line @quillsocial/eslint/avoid-web-storage
      window.localStorage.setItem(key, value);
    } catch (e) {
      // In case storage is restricted. Possible reasons
      // 1. Third Party Context in Chrome Incognito mode.
      // 2. Storage limit reached
      return;
    }
  },
};
