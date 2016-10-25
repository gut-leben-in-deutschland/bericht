/* eslint-disable */
/* global phantom */

'use strict';

var fs = require('fs'); // special phantom js module 
var beautify = require('xml-beautifier');
var system = require('system');

var resolveRoot = function() {
  return [].slice.call(arguments).join('/');
}
// no path module in phantom :(
// var resolveRoot = require('path').resolve.bind(null, __dirname, '..');

var chartIds = system.args[2].split(',');
var locale = system.args[3];
var labels = [];

function renderNextId() {
  var id = chartIds.shift();
  if (!id) {
    if (labels.length) {
      fs.write(resolveRoot('assets/labels.json.tmp'), JSON.stringify(labels), 'w');
    }
    phantom.exit();
    return;
  }

  var isOverview = id === 'overview';
  var url = system.args[1];
  if (isOverview) {
    url += '/indikatoren';
  } else {
    url += '/_chart/' + locale + '/' + id;
  }

  console.log('[render] ' + id + ' at ' + url);

  var width = 736;
  var page = require('webpage').create();
  page.viewportSize = { width: width, height: 500 };

  page.open(url, function (status) {
    if (status !== 'success') {
      console.log('Unable to load the address!');
      phantom.exit(1);
    } else {
      console.log('[render] ' + id + ' loaded');
      window.setTimeout(function () {
        if (!isOverview) {
          page.evaluate(function () {
            window.base64SvgImage = function(image) {
              var img = new Image();
              img.onload = function() {
                var canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                var context = canvas.getContext('2d');
                context.drawImage(img, 0, 0);
                image.setAttribute('xlink:href', canvas.toDataURL('image/png', 0));
              }
              img.src = image.getAttribute('xlink:href');
            }
            window.setInlineStyles = function(svg, emptySvgDeclarationComputed) {
              function explicitlySetStyle (element) {
                var cSSStyleDeclarationComputed = getComputedStyle(element);
                var i, len, key, value;
                var computedStyleStr = "";
                for (i=0, len=cSSStyleDeclarationComputed.length; i<len; i++) {
                  key=cSSStyleDeclarationComputed[i];
                  value=cSSStyleDeclarationComputed.getPropertyValue(key);
                  if (
                    key[0] === '-' // vendor things
                    || (value === 'auto' && (key === 'width' || key === 'height')) // breaks rects
                    || (value === 'visible' && (key.match(/^overflow/))) // ¯\_(ツ)_/¯
                  ) {
                    continue;
                  }
                  if (value!==emptySvgDeclarationComputed.getPropertyValue(key)) {
                    computedStyleStr+=key+":"+value+";";
                  }
                }
                element.setAttribute('style', computedStyleStr);
                element.removeAttribute('class');
              }
              function traverse(obj){
                var tree = [];
                tree.push(obj);
                visit(obj);
                function visit(node) {
                  if (node && node.hasChildNodes()) {
                    var child = node.firstChild;
                    while (child) {
                      if (child.nodeType === 1 && child.nodeName != 'SCRIPT'){
                        tree.push(child);
                        visit(child);
                      }
                      child = child.nextSibling;
                    }
                  }
                }
                return tree;
              }
              // hardcode computed css styles inside svg
              var allElements = traverse(svg);
              var i = allElements.length;
              while (i--){
                explicitlySetStyle(allElements[i]);
              }
            }
          });
          page.evaluate(function () {
            var source = document.querySelector('svg');
            var svg = source.cloneNode(true);

            var images = svg.querySelectorAll('image');
            [].forEach.call(images, function (node) {
              window.base64SvgImage(node);
            });

            var additionalHeight = 0;
            [].forEach.call(source.parentNode.childNodes, function (node) {
              if (node.nodeName !== 'svg') {
                var bbox = node.getBoundingClientRect();

                var foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
                foreignObject.setAttribute('x', 0);
                foreignObject.setAttribute('y', +source.getAttribute('height') + additionalHeight);
                foreignObject.setAttribute('width', bbox.width);
                foreignObject.setAttribute('height', bbox.height);

                additionalHeight += bbox.height;

                var body = document.createElement('body');
                body.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
                body.appendChild(node.cloneNode(true));
                foreignObject.appendChild(body);
                svg.appendChild(foreignObject);
              }
            });

            svg.setAttribute('height', +source.getAttribute('height') + additionalHeight);

            var emptySvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            document.body.appendChild(emptySvg);
            var emptySvgDeclarationComputed = getComputedStyle(emptySvg);
            document.body.appendChild(svg);

            window.setInlineStyles(svg, emptySvgDeclarationComputed);
            document.body.removeChild(svg);
            document.body.removeChild(emptySvg);

            window.clonedSvg = svg;
          });
          console.log('[render] ' + id + ' dom manipulated');
        }
        if (!isOverview) {
          var height = page.evaluate(function () {
            document.querySelector('.chart-container').style.webkitTransform = 'scale(2)'; // scale up for screenshot
            return document.body.getBoundingClientRect().height;
          });
          page.viewportSize = {width: width, height: height};
          console.log('[render] ' + id + ' viewport ' + width + 'x' + height);
        }
        // serialize on next tick – wait for base64SvgImage img onloads
        setTimeout(function() {
          if (!isOverview) {
            page.render(resolveRoot('assets/charts-' + locale, id + '.png'));
            console.log('[render] ' + id + ' png rendered');
          }

          if (!isOverview) {
            var svg = page.evaluate(function () {
              var serializer = new XMLSerializer();
              return serializer.serializeToString(window.clonedSvg);
            });
            console.log('[render] ' + id + ' svg rendered');

            fs.write(resolveRoot('assets/charts-' + locale, id + '.svg'), beautify(
              svg
                .replace(/\<\!\-\- \/?react-(text|empty)(: [0-9]+)? \-\-\>/g, '')
                .replace(/&nbsp;/g, '\u00a0') // Entity 'nbsp' not defined (in svg?)
            ), 'w');
          }

          if (locale === 'de') {
            labels = labels.concat(JSON.parse(page.evaluate(function () {
              return JSON.stringify(window.chartLabels);
            })));
          }
          page.close();
          renderNextId();
        }, 1500);
      }, 600);
    }
  });
}

renderNextId();
