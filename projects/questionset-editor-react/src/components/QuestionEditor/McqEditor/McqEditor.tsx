import React, { useRef, useState } from 'react';
import { Icon } from '../../shared/Icon';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';
import { useLabels } from '../../../hooks/useLabels';

interface McqEditorProps { readOnly?: boolean; }

export default function McqEditor({ readOnly = false }: McqEditorProps) {
  const { options, setOptions } = useQuestionStore();
  const L = useLabels();
  const [layout, setLayout] = useState<'vertical' | 'grid' | 'horizontal'>('vertical');
  const nextId = useRef(Date.now());

  const addOption = () =>
    setOptions([...options, { id: `opt-${nextId.current++}`, body: '', isCorrect: false }]);
  const removeOption = (id: string) =>
    setOptions(options.filter(o => o.id !== id));
  const markCorrect = (id: string) =>
    setOptions(options.map(o => ({ ...o, isCorrect: o.id === id })));
  const updateBody = (id: string, body: string) =>
    setOptions(options.map(o => o.id === id ? { ...o, body } : o));

  const glyph = (k: string) =>
    k === 'vertical'   ? <span className="g-v"><i /><i /></span> :
    k === 'grid'       ? <span className="g-g"><i /><i /><i /><i /></span> :
                         <span className="g-h"><i /><i /><i /><i /></span>;

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        {L('ui.options', 'Options')} <span className="hint">{L('ui.optionsHint', 'Select the radio to mark the correct answer')}</span>
      </div>

      <div className="ce-layout">
        <span className="lbl">{L('ui.selectLayout', 'Select layout')} <Icon name="info" size={14} /></span>
        <div className="seg">
          {(['vertical', 'grid', 'horizontal'] as const).map(k => (
            <button key={k} type="button" className={layout === k ? 'on' : ''} onClick={() => setLayout(k)}>
              {glyph(k)}{L(`ui.${k}`, k.charAt(0).toUpperCase() + k.slice(1))}
            </button>
          ))}
        </div>
      </div>

      <div className={`ce-opts lay-${layout}`}>
        {options.map(o => (
          <div key={o.id} className={`ce-opt${o.isCorrect ? ' correct' : ''}`}>
            <button type="button" className="pick" title="Mark correct" onClick={() => !readOnly && markCorrect(o.id)}>
              <span className="ring">{o.isCorrect && <Icon name="check" size={12} />}</span>
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
            <button type="button" className="del" title="Remove option"
              disabled={options.length <= 2 || readOnly}
              onClick={() => removeOption(o.id)}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
      </div>

      {!readOnly && (
        <button type="button" className="ce-addrow" onClick={addOption}>
          <Icon name="plus" size={15} />{L('ui.addOption', 'Add option')}
        </button>
      )}
    </div>
  );
}
