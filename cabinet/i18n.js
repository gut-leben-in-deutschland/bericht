import {Map} from 'immutable';

export const configureI18n = ({defaultLocale, locales, translationKeySeparator}, translations) => {
  if (!Array.isArray(translations)) {
    let t = () => '';
    t.locale = () => () => '';
    t.defaultLocale = () => () => '';
    return () => t;
  }

  const messages = Map().withMutations(m => {
    translations.forEach(d => {
      locales.forEach(locale => {
        m.setIn([locale, d.key], d[locale]);
      });
    });
  });

  function formatterForLocale(locale) {
    return (key, replacements, emptyValue) => {
      let message = messages.getIn([locale, key]) || (emptyValue !== undefined ? emptyValue : `[missing translation '${key}' for ${locale}]`);
      if (replacements) {
        Object.keys(replacements).forEach(replacementKey => {
          message = message.replace(`{${replacementKey}}`, replacements[replacementKey]);
        });
      }
      return message;
    };
  }

  const defaultLocaleFormatter = formatterForLocale(defaultLocale);

  return (locale) => {
    const t = locale ? formatterForLocale(locale) : defaultLocaleFormatter;
    t.locale = formatterForLocale;
    t.defaultLocale = defaultLocaleFormatter;
    return t;
  };
};
