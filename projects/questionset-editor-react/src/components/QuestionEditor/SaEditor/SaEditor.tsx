import React, { useState } from 'react';
import ContentEditable from '../../shared/ContentEditable';

interface SaEditorProps { readOnly?: boolean; }

export default function SaEditor({ readOnly = false }: SaEditorProps) {
  const [answer, setAnswer] = useState('');

  return (
    <div className="ce-ed-sec ce-ed-stem">
      <div className="ce-ed-lbl">
        Model answer <span className="hint">Shown to learners after submission</span>
      </div>
      <div style={{ border: '1px solid var(--sb-border)', borderRadius: 12, padding: '12px 15px', background: '#fff', minHeight: 110 }}>
        <ContentEditable
          value={answer}
          onChange={setAnswer}
          placeholder="Write the model answer / marking guidance…"
          minHeight={110}
          disabled={readOnly}
          bodyClass="write"
        />
      </div>
    </div>
  );
}
