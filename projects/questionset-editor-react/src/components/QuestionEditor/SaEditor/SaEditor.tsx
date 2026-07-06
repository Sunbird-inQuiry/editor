import React from 'react';
import ContentEditable from '../../shared/ContentEditable';
import { useQuestionStore } from '../../../store/question.store';
import { useLabels } from '../../../hooks/useLabels';

interface SaEditorProps { readOnly?: boolean; }

export default function SaEditor({ readOnly = false }: SaEditorProps) {
  const L = useLabels();
  const answer = useQuestionStore((s) => s.answerText);
  const setAnswer = useQuestionStore((s) => s.setAnswerText);

  return (
    <div className="ce-ed-sec ce-ed-stem">
      <div className="ce-ed-lbl">
        {L('ui.answer', 'Answer')} <span className="hint">{L('ui.saHint', 'Shown to learners after submission')}</span>
      </div>
      <div style={{ border: '1px solid var(--sb-border)', borderRadius: 12, padding: '12px 15px', background: '#fff', minHeight: 110 }}>
        <ContentEditable
          value={answer}
          onChange={setAnswer}
          placeholder={L('ui.answerPh', 'Write the answer here…')}
          minHeight={110}
          disabled={readOnly}
          bodyClass="write"
        />
      </div>
    </div>
  );
}
