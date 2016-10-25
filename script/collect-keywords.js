import rw from 'rw';
import {join} from 'path';
import {csvParse, csvFormat} from 'd3-dsv';
import parseMarkdown from '../cabinet/markdown/parse';

const argv = require('minimist')(process.argv.slice(2));

const resolveRoot = path => join(__dirname, '../', path);

const keywordsFromMd = path => {
  const md = parseMarkdown(
    rw.readFileSync(
      resolveRoot(path),
      'utf8'
    )
  );

  return md.meta.keywords;
};

const input = csvParse(rw.readFileSync('/dev/stdin', 'utf8'));
if (argv.indicators) {
  input.forEach(indicator => {
    indicator.keywords = keywordsFromMd(
      `content/${indicator.id.replace('-', '/')}/description.de.md`
    );
    indicator.keywords_en = keywordsFromMd(
      `content/${indicator.id.replace('-', '/')}/description.en.md`
    );
  });
}

if (argv.dimensions) {
  input.forEach(dimension => {
    dimension.keywords = keywordsFromMd(
      `content/${dimension.id}/description.de.md`
    );
    dimension.keywords_en = keywordsFromMd(
      `content/${dimension.id}/description.en.md`
    );
  });
}
rw.writeFileSync('/dev/stdout', csvFormat(input), 'utf8');
