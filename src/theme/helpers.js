import {scaleFactor, lineHeight, link} from 'theme/constants';

// typography

export const heading = ( size ) => {
  let scaled = Math.max(1, Math.pow( scaleFactor, 3 - size ));
  return {
    fontSize: `${scaled}em`,
    lineHeight: `${lineHeight}em`,
    fontWeight: 'normal'
  };
};

export const textLink = {
  color: link,
  textDecoration: 'none',
  paddingRight: 10,
  ':hover': {
    cursor: 'pointer',
    color: link,
    textDecoration: 'underline'
  }
};


// layout

export const flexContainer = ({...args}) => {
  let options = {
    both: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    horizontal: {
      justifyContent: 'center'
    },
    vertical: {
      alignItems: 'center'
    },
    between: {
      justifyContent: 'space-between'
    },
    around: {
      justifyContent: 'space-around'
    },
    start: {
      justifyContent: 'flex-start'
    },
    end: {
      justifyContent: 'flex-end'
    }
  };

  return {
    display: 'flex',
    flexDirection: args.direction || 'initial',
    ...options[args.center],
    ...options[args.justify],
    ...options[args.space]
  };
};
