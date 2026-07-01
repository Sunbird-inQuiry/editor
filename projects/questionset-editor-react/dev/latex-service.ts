/**
 * LaTeX → PNG conversion — same logic as editor/latexService.js.
 * Used by the dev server to handle /latex/convert requests from the
 * MathQuill equation editor iframe.
 *
 * Resolves packages from the parent editor/node_modules since
 * mathjax-full and svg2img are heavy and already installed there.
 */
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Point to parent editor's node_modules
const editorRoot = resolve(__dirname, '..', '..', '..');
const req = createRequire(resolve(editorRoot, 'package.json'));

const mathjax      = req('mathjax-full/js/mathjax').mathjax;
const TeX          = req('mathjax-full/js/input/tex').TeX;
const SVG          = req('mathjax-full/js/output/svg').SVG;
const LiteAdaptor  = req('mathjax-full/js/adaptors/liteAdaptor').LiteAdaptor;
const RegisterHTML = req('mathjax-full/js/handlers/html').RegisterHTMLHandler;
const AllPackages  = req('mathjax-full/js/input/tex/AllPackages').AllPackages;
const svg2img      = req('svg2img');

const adaptor = new LiteAdaptor();
RegisterHTML(adaptor);

const doc = mathjax.document('', {
  InputJax:  new TeX({ packages: AllPackages }),
  OutputJax: new SVG({ fontCache: 'none' }),
});

function tex2svg(equation: string, color = 'black'): string {
  const svg = adaptor
    .innerHTML(doc.convert(equation, { display: true }))
    .replace(/fill="currentColor"/, `fill="${color}"`);
  if (svg.includes('merror')) {
    return svg.replace(/<rect.+?><\/rect>/, '');
  }
  return svg;
}

function svg2png(svgString: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const match = svgString.match(/width="([\d.]+)ex" height="([\d.]+)ex"/);
    const [width, height] = match ? match.slice(1).map(Number) : [10, 5];
    svg2img(svgString, { width: width * 3 + 'ex', height: height * 3 + 'ex' },
      (err: Error, buf: Buffer) => err ? reject(err) : resolve(buf));
  });
}

export async function convertLatex(equation: string): Promise<{ data: string }> {
  const isPNG = /\.png$/.test(equation);
  const normalizedEq = equation.replace(/\.(svg|png)$/, '');
  const svgString = tex2svg(normalizedEq);

  if (isPNG) {
    const pngBuf = await svg2png(svgString);
    const base64 = pngBuf.toString('base64');
    return { data: `data:image/png;base64,${base64}` };
  }
  // SVG mode (rarely used by mathModal, but handle it)
  return { data: svgString };
}
