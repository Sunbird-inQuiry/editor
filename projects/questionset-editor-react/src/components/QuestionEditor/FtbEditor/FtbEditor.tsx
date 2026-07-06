import React from 'react';
import { Icon } from '../../shared/Icon';
import { useLabels } from '../../../hooks/useLabels';

interface FtbEditorProps {
  stemText?: string;  // plain text of the stem — blanks detected from [[text]]
  readOnly?: boolean;
}

export default function FtbEditor({ stemText = '', readOnly = false }: FtbEditorProps) {
  const L = useLabels();
  // Extract blanks from [[text]] markers in the stem's plain text
  const blanks = [...(stemText ?? '').matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1].trim());

  return (
    <div className="ce-ed-sec">
      <div className="ce-ed-lbl">
        {L('ui.ftbDetected', 'Detected blanks')} <span className="hint">{L('ui.ftbDetectedHint', 'Parsed from the [[ ]] markers in your question')}</span>
      </div>

      {blanks.length === 0 ? (
        <div className="ce-ftb-none">
          <Icon name="info" size={16} />
          {L('ui.ftbNone', 'No blanks yet — wrap an answer in [[ ]] in the question above.')}
        </div>
      ) : (
        <div className="ce-ftb-blanks">
          {blanks.map((b, i) => (
            <div key={i} className="ce-ftb-blank">
              <span className="n">{L('ui.blank', 'Blank')} {i + 1}</span>
              <span className="v">{b}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
