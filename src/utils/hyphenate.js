import Hypher from 'hypher';
import hyphenationDe from 'hyphenation.de';
import hyphenationEn from 'hyphenation.en-us';

// Map from locale to Hypher config.
const hypherConfig = {
  de: hyphenationDe,
  en: hyphenationEn
};

// Creating the Hypher object is rather expensive. This function ensures that
// it is created only once for each locale.
const hyphers = {};
function hypherForLocale(locale) {
  let hypher = hyphers[locale];

  if (hypher === undefined) {
    const config = hypherConfig[locale];
    if (config === undefined) {
      throw new Error(`hypherForLocale: unknown locale '${locale}'`);
    }

    hypher = hyphers[locale] = new Hypher(config);
  }

  return hypher;
}

 // Map<Locale,Map<String,String>>
const hyphenateCache = {de: {}, en: {}};

export function hyphenate(locale, text) {
  const cache = hyphenateCache[locale];
  if (cache === undefined) {
    throw new Error(`hyphenate: unknown locale '${locale}'`);
  }

  const cachedResult = cache[text];
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  const hyphenatedText = hypherForLocale(locale).hyphenateText(text);
  cache[text] = hyphenatedText;
  return hyphenatedText;
}
