import React, { useRef, useState } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';

interface MtfEditorProps { readOnly?: boolean; }
interface Pair { id: string; left: string; right: string; }

export default function MtfEditor({ readOnly = false }: MtfEditorProps) {
  const [pairs, setPairs] = useState<Pair[]>([
    { id: 'p1', left: '', right: '' },
    { id: 'p2', left: '', right: '' },
    { id: 'p3', left: '', right: '' },
  ]);
  const nextId = useRef(4);

  const addPair   = () => setPairs(p => [...p, { id: `p${nextId.current++}`, left: '', right: '' }]);
  const removePair = (id: string) => setPairs(p => p.filter(x => x.id !== id));
  const update    = (id: string, k: 'left' | 'right', v: string) =>
    setPairs(p => p.map(x => x.id === id ? { ...x, [k]: v } : x));

  const fieldStyle = { border: '1px solid var(--sb-border)', borderRadius: 12, padding: '11px 13px', background: '#fff', minHeight: 20 };

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        Matching pairs <span className="hint">Left items are shuffled for the learner</span>
      </div>

      <div className="ce-match-head">
        <span>Item</span><span /><span>Match</span><span />
      </div>

      {pairs.map(p => (
        <div key={p.id} className="ce-pair">
          <div className="ce-pair-fld">
            <div style={fieldStyle}>
              <ContentEditable value={p.left} onChange={v => update(p.id, 'left', v)}
                placeholder="Left item" inline disabled={readOnly} bodyClass="cell" />
            </div>
          </div>
          <span className="link"><Icon name="link" size={18} /></span>
          <div className="ce-pair-fld">
            <div style={fieldStyle}>
              <ContentEditable value={p.right} onChange={v => update(p.id, 'right', v)}
                placeholder="Correct match" inline disabled={readOnly} bodyClass="cell" />
            </div>
          </div>
          <button type="button" className="del" title="Remove pair"
            disabled={pairs.length <= 2 || readOnly} onClick={() => removePair(p.id)}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}

      {!readOnly && (
        <div style={{ marginTop: 4 }}>
          <button type="button" className="ce-addrow" onClick={addPair}>
            <Icon name="plus" size={15} />Add pair
          </button>
        </div>
      )}
    </div>
  );
}
