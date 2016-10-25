import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {ChartFromConfig} from 'components/Chart/CabinetChart';
import {measure} from 'utils/dom';
import {Map} from 'immutable';

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    position: 'relative'
  },
  chart: {
    position: 'absolute',
    bottom: 0,
    left: 0
  }
});

class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.measure = measure((ref, {width, height}) => {
      this.setState({width: Math.floor(width), height: Math.min(height, 145)});
    });
  }
  render() {
    const {id, inlineConfig} = this.props;
    const {width, height} = this.state;

    let config;
    try {
      config = JSON.parse(inlineConfig);
    } catch (e) {
      return (
        <div>
          Mini chart {id} config does not seem to be valid JSON
          <pre><code>{inlineConfig}</code></pre>
        </div>
      );
    }
    return (
      <div className={css(styles.root)} ref={this.measure}>
        {width && (
          <div className={css(styles.chart)}>
            <ChartFromConfig
              description={{id, title: '', data: config.data}}
              config={Map({...config, chromeless: true, mini: true, width, height})} />
          </div>
        )}
      </div>
    );
  }
}

Chart.propTypes = {
  id: PropTypes.string.isRequired,
  inlineConfig: PropTypes.string
};

export default Chart;
