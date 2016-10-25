
export function mapMaybe(x, f) {
  return x === undefined ? undefined : f(x);
}

export function fromMaybe(def, mb) {
  return mb === undefined ? def : mb;
}

export function maybeToList(x) {
  return x === undefined ? [] : [x];
}
