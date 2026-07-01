/**
 * Icon — renders project SVG icons from src/assets/icons/.
 * Stroke color is inherited from CSS `color` (currentColor).
 * Usage: <Icon name="book" size={16} />
 */
import React from 'react';

// Static imports using Vite's ?raw suffix — all SVGs bundled at build time
import arrowLeft   from '../../assets/icons/arrow-left.svg?raw';
import book        from '../../assets/icons/book.svg?raw';
import folder      from '../../assets/icons/folder.svg?raw';
import help        from '../../assets/icons/help.svg?raw';
import home        from '../../assets/icons/home.svg?raw';
import caret       from '../../assets/icons/caret.svg?raw';
import caretLeft   from '../../assets/icons/caret-left.svg?raw';
import caretRight  from '../../assets/icons/caret-right.svg?raw';
import plus        from '../../assets/icons/plus.svg?raw';
import more        from '../../assets/icons/more.svg?raw';
import panelLeft   from '../../assets/icons/panel-left.svg?raw';
import panelRight  from '../../assets/icons/panel-right.svg?raw';
import panelBottom from '../../assets/icons/panel-bottom.svg?raw';
import save        from '../../assets/icons/save.svg?raw';
import send        from '../../assets/icons/send.svg?raw';
import check       from '../../assets/icons/check.svg?raw';
import trash       from '../../assets/icons/trash.svg?raw';
import editSm      from '../../assets/icons/edit-sm.svg?raw';
import x           from '../../assets/icons/x.svg?raw';
import drag        from '../../assets/icons/drag.svg?raw';
import grip        from '../../assets/icons/grip.svg?raw';
import link        from '../../assets/icons/link.svg?raw';
import image       from '../../assets/icons/image.svg?raw';
import video       from '../../assets/icons/video.svg?raw';
import eye         from '../../assets/icons/eye.svg?raw';
import info        from '../../assets/icons/info.svg?raw';
import search      from '../../assets/icons/search.svg?raw';
import filter      from '../../assets/icons/filter.svg?raw';
import library     from '../../assets/icons/library.svg?raw';
import users       from '../../assets/icons/users.svg?raw';
import history     from '../../assets/icons/history.svg?raw';
import copy        from '../../assets/icons/copy.svg?raw';
import qr          from '../../assets/icons/qr.svg?raw';
import menu        from '../../assets/icons/menu.svg?raw';
import grid        from '../../assets/icons/grid.svg?raw';
import sliders     from '../../assets/icons/sliders.svg?raw';
import swap        from '../../assets/icons/swap.svg?raw';
import numlist     from '../../assets/icons/numlist.svg?raw';
import bullet      from '../../assets/icons/bullet.svg?raw';
import align       from '../../assets/icons/align.svg?raw';
import alignLeft   from '../../assets/icons/align-left.svg?raw';
import alignCenter from '../../assets/icons/align-center.svg?raw';
import alignRight  from '../../assets/icons/align-right.svg?raw';
import table       from '../../assets/icons/table.svg?raw';
import fontsize    from '../../assets/icons/fontsize.svg?raw';
import doc         from '../../assets/icons/doc.svg?raw';
import tmpl        from '../../assets/icons/tmpl.svg?raw';

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const ICONS: Record<string, string> = {
  'arrow-left':   arrowLeft,
  'book':         book,
  'folder':       folder,
  'help':         help,
  'home':         home,
  'caret':        caret,
  'caret-left':   caretLeft,
  'caret-right':  caretRight,
  'plus':         plus,
  'more':         more,
  'panel-left':   panelLeft,
  'panel-right':  panelRight,
  'panel-bottom': panelBottom,
  'save':         save,
  'send':         send,
  'check':        check,
  'trash':        trash,
  'edit-sm':      editSm,
  'x':            x,
  'drag':         drag,
  'grip':         grip,
  'link':         link,
  'image':        image,
  'video':        video,
  'eye':          eye,
  'info':         info,
  'search':       search,
  'filter':       filter,
  'library':      library,
  'users':        users,
  'history':      history,
  'copy':         copy,
  'qr':           qr,
  'menu':         menu,
  'grid':         grid,
  'sliders':      sliders,
  'swap':         swap,
  'numlist':      numlist,
  'bullet':       bullet,
  'align':        align,
  'align-left':   alignLeft,
  'align-center': alignCenter,
  'align-right':  alignRight,
  'table':        table,
  'fontsize':     fontsize,
  'doc':          doc,
  'tmpl':         tmpl,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  className,
  style,
  'aria-hidden': ariaHidden = true,
}) => {
  const raw = ICONS[name];
  if (!raw) {
    if (import.meta.env.DEV) console.warn(`[Icon] unknown icon: "${name}"`);
    return null;
  }

  // Replace hardcoded stroke color and fixed dimensions so the icon
  // inherits CSS `color` and respects the size prop.
  const svg = raw
    .replace(/stroke="#[0-9a-fA-F]{3,6}"/g, 'stroke="currentColor"')
    .replace(/\bwidth="24"/, `width="${size}"`)
    .replace(/\bheight="24"/, `height="${size}"`);

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0, ...style }}
      aria-hidden={ariaHidden}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Icon;
