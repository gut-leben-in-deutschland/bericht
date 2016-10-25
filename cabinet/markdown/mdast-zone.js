/*

Inspired by https://github.com/wooorm/mdast-zone/blob/10ec59489d045535742ce99f6f5692efbccf7038/index.js

**Zones**

Zones need to start with `start` and end with `end`. The parameters on the starting marker will be present on the `zone`.

```
<!--foo start foo=bar-->

in da zone

<!--foo end-->

=> {type: 'zone', name: 'foo', parameters: {foo: 'bar'}, children: [...]}
```

**Markers**

```
<!--iamamarker foo=bar baz-->

=> {type: 'marker', name: 'iamamarker', parameters: {foo: 'bar', baz: true}}
```

- Zones and markers can both also be inline (but they don't have that info)
- Zones can be nested
- NOTE: block zone markers need to be surrounded by newlines, othewise they won't be detected as markers

Comment and parameter parsing is directly from https://github.com/wooorm/mdast-comment-marker

*/

const trim = require('trim');
const commentMarker = require('mdast-comment-marker');

// createMarker :: Node -> Maybe(Marker)
const createMarker = (node) => {
  // Test if node is a marker, i.e. a html comment
  const marker = commentMarker(node);

  if (!marker) {
    return null;
  }

  const attributes = marker.attributes;
  let head = attributes.match(/^(start|end)\b/);

  if (head) {
    head = head[0];
    marker.attributes = trim.left(attributes.slice(head.length));
    marker.parameters[head] = undefined;
  }

  marker.type = head || 'marker';

  return marker;
};

// createZone :: Marker -> [Node] -> Zone
const createZone = (start, children) => {
  return {
    type: 'zone',
    name: start.name,
    parameters: start.parameters || {},
    children: children
  };
};

// parseZonesAndMarkers :: Node -> Node
const parseZonesAndMarkers = (parent) => {
  if (!parent.children || parent.children.length === 0) {
    return parent;
  }

  const parsedChildren = parent.children.reduce((result, child) => {
    const maybeMarker = createMarker(child);
    const type = maybeMarker && maybeMarker.type;
    const name = maybeMarker && maybeMarker.name;

    // A) Not in a zone
    if (!result.zoneStart) {
      if (type === 'marker') {
        result.children.push(maybeMarker);
        return result;
      }

      // Start of a zone
      if (type === 'start') {
        result.zoneStart = maybeMarker;
        // result.level = 1
        return result;
      }

      result.children.push(child);
      return result;
    }

    // B) Already in a zone

    // End of zone
    if (type === 'end' && result.zoneStart.name === name) {
      // result.zoneChildren.forEach(visitMarker);
      const zone = createZone(result.zoneStart, result.zoneChildren);

      // Parse nested zones
      parseZonesAndMarkers(zone);
      result.children.push(zone);

      // Reset
      result.zoneStart = null;
      result.zoneChildren = [];
      return result;
    }

    // Collect children of the zone
    result.zoneChildren.push(child);
    return result;
  }, {
    zoneStart: null,
    children: [],
    zoneChildren: []
  });

  if (parsedChildren.zoneStart) {
    throw Error('zone not ended:', parsedChildren.zoneStart.name);
  }

  // Replace old children
  parent.children = parsedChildren.children;
  return parent;
};

module.exports = () => parseZonesAndMarkers;
