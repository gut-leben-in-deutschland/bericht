import React, {PropTypes} from 'react';
import {StyleSheet, css} from 'aphrodite';

import {withCabinet} from 'cabinet';
import {NarrowContainer} from 'components/Grid/Grid';
import {ShareFooter} from 'components/Share/Share';
import {Footnotes} from 'components/Footnotes/Footnotes';
import {renderMarkdown, defaultVisitors} from 'components/Markdown/renderMarkdown';
import CabinetChart from 'components/Chart/CabinetChart';
import {FencedItemList, FenceLink} from 'components/FencedItemList/FencedItemList';

import {softBeige, text, marginM, marginL} from 'theme/constants';
import {serifRegular20} from 'theme/typeface';


const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',

    paddingTop: marginM,

    backgroundColor: softBeige
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  footer: {
  },
  linkListContainer: {
    padding: `${48}px 0`,
  },
  chart: {
    margin: `${marginL}px 0`,
    ':first-child': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  },
  chartTitle: {
    ...serifRegular20,
    color: text,
    marginBottom: 15
  }
});

const List = ({charts, filter}) => (
  <div>
    {
      charts.filter(filter).map(chart => (
        <div className={css(styles.chart)} key={chart.id}>
          <CabinetChart id={chart.id} config={{titleClassName: css(styles.chartTitle), footerLinks: true}} />
        </div>
      ))
    }
  </div>
);

List.propTypes = {
  charts: PropTypes.array.isRequired,
  filter: PropTypes.func.isRequired
};

const ChartList = withCabinet(
  ({cabinet: {locale}}) => ({charts: `charts.${locale}.csv`})
)(List);

const getIndicatorDetailVisitors = (t, indicatorId) => {
  return {
    ...defaultVisitors(t),
    code: (node, index) => {
      if (node.lang === 'chart') {
        return (
          <div className={css(styles.chart)} key={index}>
            <CabinetChart config={{titleClassName: css(styles.chartTitle), footerLinks: true}}>{node.value}</CabinetChart>
          </div>
        );
      }
      return defaultVisitors(t).code(node, index);
    },
    marker: (node, index) => {
      if (node.name === 'ChartList') {
        return (
          <ChartList key={index} filter={chart => {
            const chartIndicatorId = chart.id.split('-').slice(0, 2).join('-');
            return chart.dashboard === 'TRUE' && chartIndicatorId === indicatorId;
          }} />
        );
      }
      return null;
    }
  };
};

export function Detail({route, t, dimensionId, indicatorId, content, footnotes}) {
  const linkList = [
    footnotes.length > 0 && <Footnotes footnotes={footnotes} t={t} /> || undefined,
    (<FenceLink
      t={t}
      to={{pathname: t(`route/report-${dimensionId}`), query: {indicatorId}}}>
      {t('indicator/indicator-in-report')}
    </FenceLink>)
  ].filter(x => x !== undefined);

  return (
    <div className={css(styles.root)}>
      <div className={css(styles.content)}>
        <NarrowContainer>
          {renderMarkdown(content, {
            visitors: getIndicatorDetailVisitors(t, indicatorId)
          })}
        </NarrowContainer>
      </div>

      <div className={css(styles.footer)}>
        {linkList.length > 0 &&
        <div className={css(styles.linkListContainer)}>
          <NarrowContainer>
            <FencedItemList items={linkList} />
          </NarrowContainer>
        </div>}

        <ShareFooter route={route} />
      </div>
    </div>
  );
}


Detail.propTypes = {
  route: PropTypes.any.isRequired,
  t: PropTypes.func.isRequired,
  dimensionId: PropTypes.string.isRequired,
  indicatorId: PropTypes.string.isRequired,
  content: PropTypes.object.isRequired,
  footnotes: PropTypes.array.isRequired
};
