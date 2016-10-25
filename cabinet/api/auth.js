import queryString from 'query-string';

const generateState = () => {
  const length = 32;
  const charCodeRange = [33, 126]; // UTF-8 Basic Latin without space
  const numberOfCharacters = charCodeRange[1] - charCodeRange[0];

  return Array.from((window.crypto || window.msCrypto).getRandomValues(new Uint8Array(length)))
    .map(n => Math.round(n / 255 * numberOfCharacters))
    .map(n => String.fromCharCode(charCodeRange[0] + n))
    .join('');
};

export const configureAuth = (config) => {
  const receiveAuth = () => {
    let authHash = queryString.parse(window.location.hash);
    if (authHash.state && authHash.state === localStorage.getItem(config.auth.localStorageStateKey)) {
      localStorage.setItem(config.auth.localStorageAuthKey, JSON.stringify(authHash));
      window.history.replaceState(
        {},
        document.title,
        location.href.substr(0, location.href.length - location.hash.length)
      );
    }
  };

  // this can currently only happen on page load
  // – a user return from the redirect server
  let auth;
  if (typeof document !== 'undefined') {
    receiveAuth();
    // for now we also just read the auth once, if it changes in another tab we won't notice
    auth = JSON.parse(localStorage.getItem(config.auth.localStorageAuthKey));
  }

  const clearAuth = () => {
    auth = null;
    localStorage.removeItem(config.auth.localStorageAuthKey);
  };

  return {
    isLoggedIn: !!auth,
    getToken: () => (auth || {}).code,
    login: () => {
      const state = generateState();
      localStorage.setItem(config.auth.localStorageStateKey, state);
      window.location = `${config.auth.loginUrl}?${queryString.stringify({
        callbackUrl: window.location.href,
        scope: 'repo,admin:repo_hook',
        state
      })}`;
    },
    logout: () => {
      clearAuth();
      window.location.reload();
    }

  };
};

