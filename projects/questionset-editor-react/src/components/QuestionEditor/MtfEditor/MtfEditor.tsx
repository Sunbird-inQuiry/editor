import React, { useEffect } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';

interface MtfEditorProps { readOnly?: boolean; }

export default function MtfEditor({ readOnly = false }: MtfEditorProps) {
  // Pairs live in the question store so useSaveQuestion can serialize them.
  const pairs = useQuestionStore((s) => s.matchPairs);
  const setMatchPairs = useQuestionStore((s) => s.setMatchPairs);
  const setIsDirty = useQuestionStore((s) => s.setIsDirty);
  const addPair = useQuestionStore((s) => s.addMatchPair);
  const removePair = useQuestionStore((s) => s.removeMatchPair);
  const updatePair = useQuestionStore((s) => s.updateMatchPair);

  // Seed starter rows for a fresh question without marking the store dirty
  // (a dirty store would block hydration from question/v2/read).
  useEffect(() => {
    if (pairs.length === 0 && !readOnly) {
      setMatchPairs([
        { id: 'p1', left: '', right: '' },
        { id: 'p2', left: '', right: '' },
        { id: 'p3', left: '', right: '' },
      ]);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs.length, readOnly]);

  const update = (id: string, k: 'left' | 'right', v: string) => updatePair(id, { [k]: v });

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
