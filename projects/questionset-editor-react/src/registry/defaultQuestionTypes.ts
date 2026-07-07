/**
 * Built-in question types — the six types the old editor registered via
 * EDITOR_QUESTION_TYPE_REGISTRY multi-providers.
 *
 * Category/qType/interaction values are payload-critical: primaryCategory
 * names are the registered object categories (verified against the KP), and
 * categoryAliases cover older names still found on persisted questions.
 */
import { registerQuestionType } from './questionTypeRegistry';
import McqEditor from '../components/QuestionEditor/McqEditor/McqEditor';
import SaEditor from '../components/QuestionEditor/SaEditor/SaEditor';
import FtbEditor from '../components/QuestionEditor/FtbEditor/FtbEditor';
import MtfEditor from '../components/QuestionEditor/MtfEditor/MtfEditor';
import SeqEditor from '../components/QuestionEditor/SeqEditor/SeqEditor';
import ReoEditor from '../components/QuestionEditor/ReoEditor/ReoEditor';

export function registerDefaultQuestionTypes(): void {
  registerQuestionType({
    key: 'mcq', qType: 'MCQ',
    primaryCategory: 'Multiple Choice Question',
    interactionType: 'choice',
    label: 'Multiple Choice', labelKey: 'ui.typeMcq',
    desc: 'Pick one correct option from a list', descKey: 'ui.typeMcqDesc',
    icon: 'check',
    Editor: McqEditor,
  });
  registerQuestionType({
    key: 'sa', qType: 'SA', qTypeAliases: ['VSA', 'LA'],
    primaryCategory: 'Subjective Question',
    label: 'Subjective', labelKey: 'ui.typeSa',
    desc: 'Free-form written or long answer', descKey: 'ui.typeSaDesc',
    icon: 'doc',
    Editor: SaEditor,
  });
  registerQuestionType({
    key: 'ftb', qType: 'FTB',
    primaryCategory: 'FTB Question',
    categoryAliases: ['Fill in the Blanks'],
    interactionType: 'text',
    label: 'Fill in the Blank', labelKey: 'ui.typeFtb',
    desc: 'Hide words in a sentence with [[ ]]', descKey: 'ui.typeFtbDesc',
    icon: 'edit-sm',
    Editor: FtbEditor,
  });
  registerQuestionType({
    key: 'mtf', qType: 'MTF',
    primaryCategory: 'Match The Following Question',
    categoryAliases: ['Match The Following'],
    interactionType: 'match',
    label: 'Match the Following', labelKey: 'ui.typeMtf',
    desc: 'Pair items across two columns', descKey: 'ui.typeMtfDesc',
    icon: 'link',
    Editor: MtfEditor,
  });
  registerQuestionType({
    key: 'seq', qType: 'SEQ',
    primaryCategory: 'Sequence Question',
    interactionType: 'order',
    label: 'Sequence', labelKey: 'ui.typeSeq',
    desc: 'Arrange items in the correct order', descKey: 'ui.typeSeqDesc',
    icon: 'numlist',
    Editor: SeqEditor,
  });
  registerQuestionType({
    key: 'reo', qType: 'REO',
    primaryCategory: 'Reorder Question',
    interactionType: 'order',
    label: 'Reorder', labelKey: 'ui.typeReo',
    desc: 'Rearrange shuffled words into a sentence', descKey: 'ui.typeReoDesc',
    icon: 'swap',
    Editor: ReoEditor,
  });
}
