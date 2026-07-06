# Question Type Registry — Plan

Port the old editor's registry pattern (`EditorQuestionTypeRegistryService` +
`EDITOR_QUESTION_TYPE_REGISTRY` injection token) to the React editor so question
types are registered in one place and resolvable at runtime, with a public API
for hosts to add types without modifying the library.

## New module: `src/registry/`

- `questionTypeRegistry.ts` — `QuestionTypeDefinition` interface + registry:
  - `key` ('mcq'), `qType` ('MCQ') + `qTypeAliases` (VSA/LA → sa),
    `primaryCategory` + `categoryAliases` (legacy names), `interactionType?`
    (undefined = non-interactive), `label`/`labelKey`/`desc`/`descKey`/`icon`
    (type picker + badges), `Editor` React component
  - `registerQuestionType(def)`, `resolveQuestionType(key)`,
    `resolveByQType(qType)`, `resolveByCategory(category)` (case-insensitive,
    like the old registry), `resolveByInteractionType(type)`, `allQuestionTypes()`
- `defaultQuestionTypes.ts` — registers the six built-ins (MCQ/SA/FTB/MTF/SEQ/REO),
  consolidating data currently scattered across `PRIMARY_CATEGORY_MAP`,
  `LEGACY_CATEGORY_MAP`, `Q_TYPE`, `INTERACTION_TYPE`, `QTYPE_REVERSE`,
  `CATEGORY_REVERSE`, `QUESTION_TYPE_LABELS`, `TYPE_KEY`, and the modal's `TYPES`
- `index.ts` — registers defaults (side effect) and re-exports the API

## Consumers switched to the registry

| File | Change |
|---|---|
| `QuestionEditor.tsx` | six inline `{type === 'x' && <XEditor/>}` conditionals → `def.Editor`; type badge label via `def.labelKey` |
| `QuestionTypeSelectorModal.tsx` | hardcoded `TYPES` array → `allQuestionTypes()` |
| `useSaveQuestion.ts` | `Q_TYPE`/`INTERACTION_TYPE`/`PRIMARY_CATEGORY_MAP`/`hasInteractions` → definition fields |
| `questionRead.ts` | `deriveQuestionType` resolves via registry (qType aliases, legacy categories, interaction type) |
| `Badge.tsx`, `OutlineTree.tsx`, `ContextualEditor.tsx` | type labels via registry |
| `types/question.ts` | maps removed (union type stays); registry is the single source |
| `src/index.ts` | export `registerQuestionType` + types — public extension point (old editor's injection-token equivalent) |

## Constraints

- `FtbEditor.stemText` becomes optional (uniform `QuestionTypeEditorProps`);
  every editor receives `readOnly` + `stemText`
- No behaviour change intended — same categories, qTypes, labels, icons
- Serialization stays in `useSaveQuestion`/`questionRead` (the old editor's
  registry also mapped only category/interaction/qType → component)
