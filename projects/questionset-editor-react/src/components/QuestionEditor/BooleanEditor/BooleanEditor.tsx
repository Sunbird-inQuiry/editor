import React, { useEffect, useRef } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';

interface BooleanEditorProps { readOnly?: boolean; }

export default function BooleanEditor({ readOnly = false }: BooleanEditorProps) {
  const { options, setOptions } = useQuestionStore();
  const nextId = useRef(Date.now());

  useEffect(() => {
    if (!options || options.length !== 2) {
      setOptions([
        { id: `opt-${nextId.current++}`, body: 'True', isCorrect: false },
        { id: `opt-${nextId.current++}`, body: 'False', isCorrect: false },
      ]);
    }
  }, [options, setOptions]);

  const markCorrect = (id: string) =>
    setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));

  const updateBody = (id: string, body: string) =>
    setOptions(options.map(o => o.id === id ? { ...o, body } : o));

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        Options <span className="hint">Select the radio to mark the correct answer</span>
      </div>

      <div className="ce-opts lay-vertical">
        {options.map(o => (
          <div key={o.id} className={`ce-opt${o.isCorrect ? ' correct' : ''}`}>
            <button type="button" className="pick" title="Mark correct" onClick={() => !readOnly && markCorrect(o.id)}>
              <span className="ring">{o.isCorrect && <Icon name="check" size={12} />}</span>
            </button>
            <div className="re">
              <ContentEditable
                value={o.body}
                onChange={html => updateBody(o.id, html)}
                placeholder="Option text…"
                inline
                disabled={readOnly}
                bodyClass="opt"
              />
            </div>
            {o.isCorrect && <span className="badge-correct">Correct</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
