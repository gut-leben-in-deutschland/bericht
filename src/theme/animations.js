export function bounceDownKeyframes() {
  return {
    '0%, 20%, 50%, 80%, 100%': {
      transform: `translate(50%, -50%) translateY(0)`,
    },
    '40%': {
      transform: `translate(50%, -50%) translateY(-15px)`,
    },
    '60%': {
      transform: `translate(50%, -50%) translateY(-5px)`,
    },
  };
}

export function bounceDownAnimation() {
  return {
    animationName: bounceDownKeyframes(),
    animationDuration: '2s',
    animationIterationCount: 'infinite',
  };
}
