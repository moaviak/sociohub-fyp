import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = new Storage({
  // maximum capacity, default 1000 key-ids
  size: 1000,

  // Use AsyncStorage for RN apps, or window.localStorage for web apps.
  // If storageBackend is not set, data will be lost after reload.
  storageBackend: AsyncStorage, // for web: window.localStorage

  // expire time, default: 1 day (1000 * 3600 * 24 milliseconds).
  // can be null, which means never expire.
  defaultExpires: 1000 * 3600 * 24,

  // cache data in the memory. default is true.
  enableCache: true,

  // if data was not found in storage or expired data was found,
  // the corresponding sync method will be invoked returning
  // the latest data.
  sync: {
    // we'll talk about the details later.
  },
});

// LocalStorage keys
const ACCESS_TOKEN_KEY = "SociohubAccessToken";
const REFRESH_TOKEN_KEY = "SociohubRefreshToken";

/**
 * Saves auth tokens to AsyncStorage.
 */
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await storage.save({
    key: ACCESS_TOKEN_KEY,
    data: accessToken,
    expires: 1000 * 60 * 15, // 15 minutes
  });
  await storage.save({
    key: REFRESH_TOKEN_KEY,
    data: refreshToken,
    expires: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

/**
 * Retrieves tokens from AsyncStorage
 */
export const getTokens = async () => {
  const accessToken: string | null = await storage.load({
    key: ACCESS_TOKEN_KEY,
    autoSync: false,
  });
  const refreshToken: string | null = await storage.load({
    key: REFRESH_TOKEN_KEY,
    autoSync: false,
  });
  return { accessToken, refreshToken };
};

/**
 * Clears auth tokens from AsyncStorage
 */
export const clearTokens = async () => {
  await Promise.all([
    storage.remove({ key: ACCESS_TOKEN_KEY }),
    storage.remove({ key: REFRESH_TOKEN_KEY }),
  ]);
};

/**
 * Checks if refresh token exists in localStorage
 */
export const hasRefreshToken = async () => {
  try {
    const refreshToken = await storage.load({
      key: REFRESH_TOKEN_KEY,
      autoSync: false,
    });
    return !!refreshToken;
  } catch (error) {
    return false;
  }
};

export default storage;
