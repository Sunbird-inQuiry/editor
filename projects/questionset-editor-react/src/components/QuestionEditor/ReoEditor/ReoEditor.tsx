import React, { useMemo } from 'react';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';

interface ReoEditorProps { readOnly?: boolean; }

export default function ReoEditor({ readOnly = false }: ReoEditorProps) {
  // Sentence lives in the question store so useSaveQuestion can serialize it.
  const sentence = useQuestionStore((s) => s.sentence);
  const setSentence = useQuestionStore((s) => s.setSentence);

  // Strip HTML tags to get plain text for word chips
  const plainText = sentence.replace(/<[^>]+>/g, '').trim();
  const words = plainText.split(/\s+/).filter(Boolean);

  // Deterministic shuffle so chips don't jump on every keystroke
  const shuffled = useMemo(() => {
    const a = [...words];
    for (let i = a.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, [plainText]);

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        Sentence <span className="hint">Type the correct sentence — words shuffle automatically for the learner</span>
      </div>

      <div style={{ border: '1px solid var(--sb-border)', borderRadius: 14, padding: '16px 18px', background: '#fff', minHeight: 70 }}>
        <ContentEditable
          value={sentence}
          onChange={setSentence}
          placeholder="Type the correct sentence…"
          disabled={readOnly}
          bodyClass=""
        />
      </div>

      <div className="ce-reorder-chips" style={{ marginTop: 16 }}>
        {shuffled.length === 0
          ? <span className="ce-reorder-empty">Words will appear here as shuffled chips</span>
          : shuffled.map((w, i) => <span key={i} className="ce-reorder-chip">{w}</span>)
        }
      </div>
    </div>
  );
}
