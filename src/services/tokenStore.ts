let _accessToken: string | null = null;

export const tokenStore = {
  setAccessToken: (t: string) => { _accessToken = t; },
  getAccessToken: () => _accessToken,
  clearAccessToken: () => { _accessToken = null; },
};
