import React, {PropTypes, Component} from 'react';
import {StyleSheet, css} from 'aphrodite';
import {withCabinet} from 'cabinet';
import {midGrey} from 'theme/constants';
import {sansRegular12} from 'theme/typeface';

const Img = ({dispatch, cabinet, locale, ...imgProps}) => // eslint-disable-line no-unused-vars,react/prop-types
  <img {...imgProps} />;

const selectImage = ({src}) => {
  return {
    src
  };
};

const ContentImage = withCabinet(
  selectImage
)(Img);

// support prose.io / jekyll / github pages
const baseUrl = new RegExp(`^${encodeURIComponent('{{site.baseurl}}')}/`);
const normalizeSrc = (src) => {
  return src
    .replace(baseUrl, '');
};

const Image = ({src, ...rest}) => {
  if (src.match(/(https?:)?\/\//)) {
    return <img src={src} {...rest} />;
  }
  return <ContentImage src={normalizeSrc(src)} {...rest} />;
};

Image.propTypes = {
  src: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  figure: {
    margin: 0,
  },
  img: {
    display: 'block',
    maxWidth: '100%',
  },
  caption: {
    ...sansRegular12,
    color: midGrey,
    margin: '10px 0'
  },
});

let figureId = 0;
class ImageWithCaption extends Component {
  constructor(props) {
    super(props);
    this.figureId = `figcaption-${figureId++}`;
  }
  render() {
    const {src, alt, caption} = this.props;
    return (
      <figure aria-labelledby={this.figureId} className={css(styles.figure)}>
        <Image src={src} alt={alt} className={css(styles.img)} />
        {caption && <figcaption id={this.figureId} className={css(styles.caption)}>
          {caption}
        </figcaption>}
      </figure>
    );
  }
}

ImageWithCaption.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  caption: PropTypes.string
};

export default ImageWithCaption;
