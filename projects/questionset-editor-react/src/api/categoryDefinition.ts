import { apiClient } from './client';

export interface ICategoryField {
  code: string;
  label: string;
  name?: string;
  inputType?: string;
  dataType?: string;
  required: boolean;
  editable: boolean;
  visible: boolean;
  placeholder?: string;
  maxLength?: number;
  depends?: string[];
  sourceCategory?: string;
  range?: unknown;
  enum?: string[];
  default?: unknown;
  defaultValue?: unknown;
  index?: number;
  section?: string;
  output?: string;
  [key: string]: unknown;
}

export interface IParsedCategoryDefinition {
  rootForm: ICategoryField[];
  unitForm: ICategoryField[];
  childForm: ICategoryField[];
  searchForm: ICategoryField[];
  relationalForm: ICategoryField[];
  publishChecklist: ICategoryField[];
  reviewChecklist: ICategoryField[];
  rfcChecklist: ICategoryField[];
  schemaDefaults: Record<string, unknown>;
  frameworkMetadata: { orgFWType?: string[]; targetFWType?: string[] };
  sourcingSettings: Record<string, unknown>;
}

function maxLengthFromValidations(field: Record<string, unknown>): number | undefined {
  const validations = field.validations as Array<Record<string, unknown>> | undefined;
  const ml = validations?.find(v => v.type === 'maxlength' || v.type === 'maxLength');
  if (!ml) return field.maxLength as number | undefined;
  const n = Number(ml.value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeField(raw: Record<string, unknown>, section?: string): ICategoryField {
  return {
    code: (raw.code as string) ?? '',
    label: (raw.label as string) ?? (raw.name as string) ?? (raw.code as string) ?? '',
    name: raw.name as string | undefined,
    inputType: raw.inputType as string | undefined,
    dataType: raw.dataType as string | undefined,
    // appIcon is never mandatory — the old Angular editor didn't enforce it either.
    required:
      raw.inputType !== 'appIcon' && (
        raw.required === true ||
        (Array.isArray(raw.validations) &&
          (raw.validations as Array<Record<string, unknown>>).some(v => v.type === 'required')) ||
        String((raw.renderingHints as Record<string, unknown>)?.class ?? '').includes('required')
      ),
    editable: raw.editable !== false,
    visible: raw.visible !== false,
    placeholder: raw.placeholder as string | undefined,
    maxLength: maxLengthFromValidations(raw),
    depends: raw.depends as string[] | undefined,
    sourceCategory: raw.sourceCategory as string | undefined,
    range: raw.range,
    enum: raw.enum as string[] | undefined,
    default: raw.default,
    defaultValue: raw.defaultValue,
    index: raw.index as number | undefined,
    section,
    output: raw.output as string | undefined,
  };
}

// Maps API group names to canonical section strings used by the tab filter.
const GROUP_SECTION_MAP: Record<string, string> = {
  'Basic details':            'Details',
  'Framework details':        'Audience & Curriculum',
  'Question set behaviour':   'Behaviour',
  // Section (unitMetadata) — no groups, assigned by field code below
};

// unitMetadata fields that belong to the Behaviour tab.
const UNIT_BEHAVIOUR_FIELDS = new Set([
  'maxQuestions', 'shuffle', 'showFeedback', 'showSolutions', 'showHint',
]);

function parseForm(form: unknown, isUnit = false): ICategoryField[] {
  const properties = (form as { properties?: unknown })?.properties;
  if (!Array.isArray(properties)) return [];
  const fields: ICategoryField[] = [];
  for (const item of properties as Array<Record<string, unknown>>) {
    if (Array.isArray(item.fields)) {
      const groupName = (item.name as string) ?? (item.title as string) ?? '';
      const section = GROUP_SECTION_MAP[groupName] ?? groupName ?? 'Details';
      for (const f of item.fields as Array<Record<string, unknown>>) {
        if (f.code) fields.push(normalizeField(f, section));
      }
    } else if (item.code) {
      const code = item.code as string;
      const section = isUnit
        ? (UNIT_BEHAVIOUR_FIELDS.has(code) ? 'Behaviour' : 'Details')
        : 'Details';
      fields.push(normalizeField(item, section));
    }
  }
  return fields.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

function parseSchemaDefaults(schema: unknown): Record<string, unknown> {
  const props = (schema as { properties?: Record<string, Record<string, unknown>> })?.properties;
  if (!props) return {};
  const out: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(props)) {
    if (def && 'default' in def) out[key] = def.default;
  }
  return out;
}

export async function getCategoryDefinition(
  categoryName: string,
  channel: string,
  objectType = 'QuestionSet',
  version: 'v1' | 'v4' = 'v1',
): Promise<IParsedCategoryDefinition> {
  const response = await apiClient.post(
    `/action/object/category/definition/${version}/read?fields=objectMetadata,forms,name,label`,
    {
      request: {
        objectCategoryDefinition: {
          objectType,
          name: categoryName,
          ...(channel ? { channel } : {}),
        },
      },
    },
  );

  const ocd = response.data?.result?.objectCategoryDefinition as Record<string, unknown> | undefined;
  const forms = (ocd?.forms ?? {}) as Record<string, unknown>;
  const objectMetadata = (ocd?.objectMetadata ?? {}) as Record<string, unknown>;
  const config = (objectMetadata.config ?? {}) as Record<string, unknown>;

  const rootFormRaw = parseForm(forms.create);

  // Move primaryCategory (Type) beside name → same grid row
  const nameIdx = rootFormRaw.findIndex(f => f.code === 'name');
  const typeIdx = rootFormRaw.findIndex(f => f.code === 'primaryCategory');
  if (nameIdx !== -1 && typeIdx !== -1 && typeIdx !== nameIdx + 1) {
    const [typeField] = rootFormRaw.splice(typeIdx, 1);
    rootFormRaw.splice(nameIdx + 1, 0, typeField);
  }

  // Reorder Behaviour fields to match design:
  // maxTime | maxAttempts → requiresSubmit | summaryType → showTimer (full-width last)
  const BEHAVIOUR_ORDER = ['maxTime', 'maxAttempts', 'requiresSubmit', 'summaryType', 'showTimer'];
  const behaviourFields = rootFormRaw.filter(f => BEHAVIOUR_ORDER.includes(f.code));
  const otherFields     = rootFormRaw.filter(f => !BEHAVIOUR_ORDER.includes(f.code));
  const sortedBehaviour = BEHAVIOUR_ORDER
    .map(code => behaviourFields.find(f => f.code === code))
    .filter((f): f is ICategoryField => !!f);

  return {
    rootForm: [...otherFields, ...sortedBehaviour],
    unitForm: parseForm(forms.unitMetadata, true),
    childForm: parseForm(forms.childMetadata ?? forms.questionMetadata),
    searchForm: parseForm(forms.search ?? forms.searchConfig),
    relationalForm: parseForm(forms.relationalMetadata),
    publishChecklist: parseForm(forms.publishchecklist),
    reviewChecklist: parseForm(forms.review),
    rfcChecklist: parseForm(forms.requestforchangeschecklist),
    schemaDefaults: parseSchemaDefaults(objectMetadata.schema),
    frameworkMetadata: (config.frameworkMetadata ?? {}) as { orgFWType?: string[]; targetFWType?: string[] },
    sourcingSettings: (config.sourcingSettings ?? {}) as Record<string, unknown>,
  };
}
