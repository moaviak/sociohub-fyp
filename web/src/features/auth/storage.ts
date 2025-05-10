// Token storage utils for persistent authentication

// LocalStorage keys
const ACCESS_TOKEN_KEY = "sociohub_access_token";
const REFRESH_TOKEN_KEY = "sociohub_refresh_token";

/**
 * Saves auth tokens to localStorage
 */
export const saveTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Retrieves tokens from localStorage
 */
export const getTokens = () => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  return { accessToken, refreshToken };
};

/**
 * Clears auth tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Checks if refresh token exists in localStorage
 */
export const hasRefreshToken = () => {
  return !!localStorage.getItem(REFRESH_TOKEN_KEY);
};
