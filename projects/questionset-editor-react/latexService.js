/**
 * LaTeX → PNG/SVG conversion service.
 *
 * Port of editor/latexService.js as ESM. Uses mathjax-full + svg2img from
 * editor/node_modules (resolved automatically since that directory is an
 * ancestor of this file).
 *
 * Exported as Express route handlers:
 *   GET  /latex/convert?equation=<tex>
 *   POST /latex/convert  { equation: "<tex>" }
 *
 * Append ".png" to the equation string to get a base64 PNG data URL back
 * (JSON: { data: "data:image/png;base64,..." }).
 * Without ".png" the response is the raw SVG (image/svg+xml).
 */
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Use createRequire so we can load CJS packages (mathjax-full, svg2img).
// Node walks up to editor/node_modules automatically.
const require = createRequire(import.meta.url);

const mathjax      = require('mathjax-full/js/mathjax').mathjax;
const TeX          = require('mathjax-full/js/input/tex').TeX;
const SVG          = require('mathjax-full/js/output/svg').SVG;
const LiteAdaptor  = require('mathjax-full/js/adaptors/liteAdaptor').LiteAdaptor;
const RegisterHTML = require('mathjax-full/js/handlers/html').RegisterHTMLHandler;
const AllPackages  = require('mathjax-full/js/input/tex/AllPackages').AllPackages;
const svg2img      = require('svg2img');

const adaptor = new LiteAdaptor();
RegisterHTML(adaptor);

const doc = mathjax.document('', {
  InputJax:  new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }),
});

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function tex2svg(equation, color = 'black') {
  const svg = adaptor
    .innerHTML(doc.convert(equation, { display: true }))
    .replace(/fill="currentColor"/, `fill="${color}"`);
  // Strip bounding-box rect from error output so callers can detect "merror"
  if (svg.includes('merror')) {
    return svg.replace(/<rect.+?><\/rect>/, '');
  }
  return svg;
}

function svgToPngBuffer(svgString) {
  return new Promise((resolve, reject) => {
    const match = svgString.match(/width="([\d.]+)ex" height="([\d.]+)ex"/);
    const [w, h] = match ? match.slice(1).map(Number) : [10, 5];
    svg2img(
      svgString,
      { width: `${w * 3}ex`, height: `${h * 3}ex` },
      (err, buf) => (err ? reject(err) : resolve(buf)),
    );
  });
}

// ---------------------------------------------------------------------------
// Programmatic API (used by mock-api-plugin in Vite dev server)
// ---------------------------------------------------------------------------

export async function convertLatex(equation) {
  const isPNG       = /\.png$/.test(equation);
  const normalizedEq = equation.replace(/\.(svg|png)$/, '');
  const svgString   = tex2svg(normalizedEq);

  if (isPNG) {
    const buf    = await svgToPngBuffer(svgString);
    const base64 = buf.toString('base64');
    return { data: `data:image/png;base64,${base64}` };
  }
  return { data: svgString };
}

// ---------------------------------------------------------------------------
// Express route handler
// ---------------------------------------------------------------------------

export async function convert(req, res) {
  const equation = req.query?.equation ?? req.body?.equation ?? '';
  if (!equation) {
    res.status(400).send('Bad Request: equation parameter required');
    return;
  }

  const isPNG           = /\.png$/.test(equation);
  const normalizedEq    = equation.replace(/\.(svg|png)$/, '');
  const svgString       = tex2svg(normalizedEq);

  res.setHeader('cache-control', 's-maxage=604800, maxage=604800');

  if (isPNG) {
    try {
      const buf    = await svgToPngBuffer(svgString);
      const base64 = buf.toString('base64');
      res.contentType('application/json');
      res.send({ data: `data:image/png;base64,${base64}` });
    } catch {
      res.status(500).send('Equation rendering failed');
    }
  } else {
    res.contentType('image/svg+xml');
    res.write(
      '<?xml version="1.0" standalone="no" ?>\n' +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.0//EN" ' +
      '"http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd">\n',
    );
    res.end(svgString);
  }
}
