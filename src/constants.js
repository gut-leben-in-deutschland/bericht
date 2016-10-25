export const DEFAULT_LOCALE = 'de';
// en is currently disabled except for chart rendering
export const AVAILABLE_LOCALES = __PHANTOM__ ? ['de', 'en'] : ['de'];

export const GITHUB_CONTENT_SOURCE = {
  username: 'interactivethings',
  reponame: 'quality-of-life-in-germany',
  ref: 'master'
};

export const GITHUB_AUTH = {
  localStorageAuthKey: 'githubAuth',
  localStorageStateKey: 'githubState',
  loginUrl: 'https://ixt-auth.herokuapp.com/github/login'
};
