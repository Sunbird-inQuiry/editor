import React from 'react';
import { Icon } from '../shared/Icon';
import type { INode } from '../../types/editor';
import type { QuestionType } from '../../types/question';
import { QUESTION_TYPE_LABELS } from '../../types/question';

interface QuestionDetailProps {
  node: INode;
  onOpenEditor: () => void;
  onRemove: () => void;
  isEditMode?: boolean;
}

function getEditorState(node: INode): Record<string, unknown> {
  return (node.metadata?.editorState as Record<string, unknown>) ?? {};
}
function getOptions(node: INode) {
  return ((node.metadata?.options ?? getEditorState(node).options) as Array<{ id: string; body: string; isCorrect?: boolean }>) ?? [];
}
function getQuestion(node: INode): string {
  return (node.metadata?.body as string) ?? (getEditorState(node).question as string) ?? '';
}
function getMatchPairs(node: INode) {
  return ((node.metadata?.matchPairs ?? getEditorState(node).matchPairs) as Array<{ id: string; left: string; right: string }>) ?? [];
}
function getSequence(node: INode): string[] {
  return ((node.metadata?.sequence ?? getEditorState(node).sequence) as string[]) ?? [];
}
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}
function parseFtbBlanks(text: string): string[] {
  return [...text.matchAll(/\[\[(.+?)\]\]/g)].map(m => m[1]);
}

function McqPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  const opts = getOptions(node);
  return (
    <>
      {stem && <p className="ce-qstem">{stem}</p>}
      {opts.map(o => (
        <div key={o.id} className={`ce-qopt${o.isCorrect ? ' correct' : ''}`}>
          <span className="mk">{o.isCorrect && <Icon name="check" size={12} />}</span>
          {stripHtml(o.body) || ' '}
        </div>
      ))}
    </>
  );
}

function FtbPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  const blanks = parseFtbBlanks(stem);
  const display = stem.replace(/\[\[(.+?)\]\]/g, '___');
  return (
    <>
      {display && <p className="ce-qstem">{display}</p>}
      {blanks.length > 0 ? (
        <div className="ce-ftb-blanks">
          {blanks.map((b, i) => (
            <div key={i} className="ce-ftb-blank">
              <span className="n">Blank {i + 1}</span>
              <span className="v">{b}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ce-ftb-none">No blanks detected — wrap answers in [[ ]]</div>
      )}
    </>
  );
}

function SaPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  return (
    <>
      {stem && <p className="ce-qstem">{stem}</p>}
      <div style={{ border: '1.5px dashed var(--sb-border)', borderRadius: 13, height: 90, display: 'grid', placeItems: 'center', color: 'var(--sb-text-faint)', fontSize: 13.5, background: '#fff' }}>
        Learner writes a long-form answer here
      </div>
    </>
  );
}

function MtfPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  const pairs = getMatchPairs(node);
  return (
    <>
      {stem && <p className="ce-qstem">{stem}</p>}
      {pairs.length > 0 ? (
        <div className="ce-match-grid">
          <div className="ce-match-col">
            {pairs.map(p => <div key={p.id} className="ce-qopt" style={{ justifyContent: 'center' }}>{stripHtml(p.left)}</div>)}
          </div>
          <div className="ce-match-col">
            {pairs.map(p => <div key={p.id} className="ce-qopt" style={{ justifyContent: 'center' }}>{stripHtml(p.right)}</div>)}
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>No pairs defined yet.</p>
      )}
    </>
  );
}

function SeqPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  const seq = getSequence(node);
  return (
    <>
      {stem && <p className="ce-qstem">{stem}</p>}
      <div className="ce-seq-list">
        {seq.length === 0
          ? <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>No items defined yet.</p>
          : seq.map((item, i) => (
            <div key={i} className="ce-seq-item">
              <Icon name="drag" size={16} style={{ color: 'var(--sb-text-faint)', flexShrink: 0 }} />
              <span className="ce-seq-num">{i + 1}</span>
              {stripHtml(item)}
            </div>
          ))}
      </div>
    </>
  );
}

function ReoPreview({ node }: { node: INode }) {
  const stem = stripHtml(getQuestion(node));
  const words = stem.split(/\s+/).filter(Boolean);
  const shuffled = React.useMemo(() => {
    const a = [...words];
    for (let i = a.length - 1; i > 0; i--) { const j = (i * 7 + 3) % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }, [stem]);
  return (
    <>
      <p className="ce-qstem">Reorder the words to form a correct sentence.</p>
      <div className="ce-reo-chips">
        {shuffled.length === 0
          ? <span style={{ color: 'var(--sb-text-faint)', fontStyle: 'italic', fontSize: 13.5 }}>No sentence defined yet.</span>
          : shuffled.map((w, i) => <span key={i} className="ce-reo-chip">{w}</span>)}
      </div>
    </>
  );
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ node, onOpenEditor, onRemove, isEditMode = true }) => {
  const qType = (node.questionType ?? node.metadata?.questionType ?? 'mcq') as QuestionType;

  return (
    <>
      {qType === 'mcq' && <McqPreview node={node} />}
      {qType === 'ftb' && <FtbPreview node={node} />}
      {qType === 'sa'  && <SaPreview node={node} />}
      {qType === 'mtf' && <MtfPreview node={node} />}
      {qType === 'seq' && <SeqPreview node={node} />}
      {qType === 'reo' && <ReoPreview node={node} />}
      {!['mcq', 'ftb', 'sa', 'mtf', 'seq', 'reo'].includes(qType) && (
        <p style={{ color: 'var(--sb-text-faint)', fontSize: 14 }}>
          Preview not available for this question type.
        </p>
      )}

      {isEditMode && (
        <div className="ce-qactions">
          <button className="ce-btn primary" onClick={onOpenEditor} type="button">
            <Icon name="edit-sm" size={15} />Open in editor
          </button>
          <button className="ce-btn danger" onClick={onRemove} type="button">
            <Icon name="trash" size={15} />Remove
          </button>
        </div>
      )}
    </>
  );
};

export default QuestionDetail;
