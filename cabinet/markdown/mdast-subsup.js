const inlineSub = (eat, value, silent) => {
  const match = /^<sub>([^<]+)<\/sub>/.exec(value);

  if (match) {
    if (silent) {
      return true;
    }

    return eat(match[0])({
      type: 'sub',
      value: match[1]
    });
  }

  return null;
};

inlineSub.locator = (value, fromIndex) => value.indexOf('<sub>', fromIndex);

const inlineSup = (eat, value, silent) => {
  const match = /^<sup>([^<]+)<\/sup>/.exec(value);

  if (match) {
    if (silent) {
      return true;
    }

    return eat(match[0])({
      type: 'sup',
      value: match[1]
    });
  }

  return null;
};

inlineSup.locator = (value, fromIndex) => value.indexOf('<sup>', fromIndex);

module.exports = (processor) => {
  const Parser = processor.Parser;
  const tokenizers = Parser.prototype.inlineTokenizers;
  const methods = Parser.prototype.inlineMethods;

  tokenizers.sub = inlineSub;
  tokenizers.sup = inlineSup;

  // Insert these tokenizers before the html tokenizer, so they don't end up being parsed as html tags
  methods.splice(methods.indexOf('html'), 0, 'sub', 'sup');
};
