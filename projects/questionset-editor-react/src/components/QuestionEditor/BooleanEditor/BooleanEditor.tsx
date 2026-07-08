import React, { useEffect, useRef } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';
import { useLabels } from '../../../hooks/useLabels';

interface BooleanEditorProps { readOnly?: boolean; }

export default function BooleanEditor({ readOnly = false }: BooleanEditorProps) {
  const L = useLabels();
  const options     = useQuestionStore((s) => s.options);
  const setOptions  = useQuestionStore((s) => s.setOptions);
  const setIsDirty  = useQuestionStore((s) => s.setIsDirty);
  const nextId = useRef(Date.now());

  // Seed True/False bodies when the store has 2 options with empty bodies
  // (DEFAULT_OPTIONS pre-populates 2 blank entries).
  // Using !readOnly prevents seeding during hydration from question/v2/read.
  // setIsDirty(false) afterwards mirrors MtfEditor/SeqEditor so hydration
  // is not blocked by the seeding write.
  useEffect(() => {
    if (readOnly) return;
    const needsSeed =
      options.length === 0 ||
      (options.length === 2 &&
        !options[0].body?.replace(/<[^>]+>/g, '').trim() &&
        !options[1].body?.replace(/<[^>]+>/g, '').trim());
    if (needsSeed) {
      setOptions([
        { id: options[0]?.id ?? `opt-${nextId.current++}`, body: 'True',  isCorrect: false },
        { id: options[1]?.id ?? `opt-${nextId.current++}`, body: 'False', isCorrect: false },
      ]);
      setIsDirty(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  const markCorrect = (id: string) =>
    setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));

  const updateBody = (id: string, body: string) =>
    setOptions(options.map(o => o.id === id ? { ...o, body } : o));

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        {L('ui.options', 'Options')} <span className="hint">{L('ui.optionsHint', 'Select the radio to mark the correct answer')}</span>
      </div>

      <div className="ce-opts lay-vertical">
        {options.map(o => (
          <div key={o.id} className={`ce-opt${o.isCorrect ? ' correct' : ''}`}>
            <button type="button" className="pick" title="Mark correct" onClick={() => !readOnly && markCorrect(o.id)}>
              <span className="pick-ring">{o.isCorrect && <Icon name="check" size={12} />}</span>
            </button>
            <div className="re">
              <ContentEditable
                value={o.body}
                onChange={html => updateBody(o.id, html)}
                placeholder={L('ui.optionPh', 'Option text…')}
                inline
                disabled={readOnly}
                bodyClass="opt"
              />
            </div>
            {o.isCorrect && <span className="badge-correct">{L('ui.correct', 'Correct')}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
