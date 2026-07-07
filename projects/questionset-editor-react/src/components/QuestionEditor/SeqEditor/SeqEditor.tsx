import React, { useEffect } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';
import { useLabels } from '../../../hooks/useLabels';

interface SeqEditorProps { readOnly?: boolean; }
interface Item { id: string; value: string; }

export default function SeqEditor({ readOnly = false }: SeqEditorProps) {
  const L = useLabels();
  // Items live in the question store (sequence: string[]) so useSaveQuestion
  // can serialize them; ids are positional for React keys.
  const sequence = useQuestionStore((s) => s.sequence);
  const setSequence = useQuestionStore((s) => s.setSequence);
  const setIsDirty = useQuestionStore((s) => s.setIsDirty);
  // SEQ supports vertical/horizontal only — 'grid' (a leftover from an MCQ
  // read) renders as vertical.
  const storeLayout = useQuestionStore((s) => s.layout);
  const setLayout = useQuestionStore((s) => s.setLayout);
  const layout: 'vertical' | 'horizontal' = storeLayout === 'horizontal' ? 'horizontal' : 'vertical';

  // Seed starter rows without dirtying the store (dirty blocks read hydration).
  useEffect(() => {
    if (sequence.length === 0 && !readOnly) {
      setSequence(['', '']);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sequence.length, readOnly]);

  const items: Item[] = sequence.map((value, i) => ({ id: `i${i}`, value }));

  const addItem    = () => setSequence([...sequence, '']);
  const removeItem = (id: string) => setSequence(sequence.filter((_, i) => `i${i}` !== id));
  const update     = (id: string, v: string) => setSequence(sequence.map((s, i) => (`i${i}` === id ? v : s)));

  const glyph = (k: string) =>
    k === 'vertical' ? <span className="g-v"><i /><i /></span>
                     : <span className="g-h"><i /><i /><i /><i /></span>;

  const fieldStyle = { flex: 1, border: 'none', background: 'transparent', outline: 'none', minHeight: 20 };

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        {L('ui.seqLabel', 'Items in correct order')} <span className="hint">{L('ui.seqHint', 'Order here is the answer; learners see them shuffled')}</span>
      </div>

      <div className="ce-layout">
        <span className="lbl">{L('ui.selectLayout', 'Select layout')} <Icon name="info" size={14} /></span>
        <div className="seg">
          {(['vertical', 'horizontal'] as const).map(k => (
            <button key={k} type="button" className={layout === k ? 'on' : ''} onClick={() => setLayout(k)}>
              {glyph(k)}{L(`ui.${k}`, k.charAt(0).toUpperCase() + k.slice(1))}
            </button>
          ))}
        </div>
      </div>

      <div className={`ce-seq lay-${layout}`}>
        {items.map((it, i) => (
          <div key={it.id} className="ce-seqitem">
            <span className="ord">{i + 1}</span>
            <div style={fieldStyle}>
              <ContentEditable value={it.value} onChange={v => update(it.id, v)}
                placeholder={`${L('ui.stepPh', 'Step')} ${i + 1}`} inline disabled={readOnly} bodyClass="seqline" />
            </div>
            <button type="button" className="del" title="Remove"
              disabled={items.length <= 2 || readOnly} onClick={() => removeItem(it.id)}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
      </div>

      {!readOnly && (
        <div style={{ marginTop: 12 }}>
          <button type="button" className="ce-addrow" onClick={addItem}>
            <Icon name="plus" size={15} />{L('ui.addItem', 'Add item')}
          </button>
        </div>
      )}
    </div>
  );
}
