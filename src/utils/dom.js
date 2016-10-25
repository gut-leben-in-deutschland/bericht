import raf from 'raf';

export const measure = onMeasure => {
  let ref;
  let rafHandle;
  const update = () => {
    onMeasure(
      ref,
      ref.getBoundingClientRect()
    );
  };
  return newRef => {
    ref = newRef;
    if (ref) {
      window.addEventListener('resize', update);
      rafHandle = raf(update); // raf needed to wait for aphrodite css styles (injected with asap)
    } else {
      window.removeEventListener('resize', update);
      raf.cancel(rafHandle);
    }
  };
};

export const scrollY = () => window.pageYOffset;
export const scrollX = () => window.pageXOffset;


// Feature detect passive event listeners
// See https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md why this is a good idea

let supportsPassiveOption = false;
if (typeof window !== 'undefined') {
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function passive() {
        supportsPassiveOption = true;
      }
    });
    window.addEventListener('test', null, opts);
  } catch (e) {} // eslint-disable-line no-empty
}

// Get the passive event option based on its availability; otherwise just mark the event as not cancelable (which improves performance but not as reliably as {passive: true})
// NEVER CALL preventDefault() IN A PASSIVE EVENT HANDLER
export const passiveEvent = () => {
  return supportsPassiveOption
    ? {passive: true}
    : false;
};
