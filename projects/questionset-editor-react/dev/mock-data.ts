// Mock API responses used by the dev server when VITE_BASE_URL is not set.
// Edit these to match the questionset structure you want to test with.

export const MOCK_QUESTIONSET_ID = 'do_test_questionset_001';

export const MOCK_HIERARCHY = {
  responseCode: 'OK',
  result: {
    questionSet: {
      identifier: MOCK_QUESTIONSET_ID,
      name: 'Sample Practice Question Set',
      objectType: 'QuestionSet',
      primaryCategory: 'Practice Question Set',
      mimeType: 'application/vnd.ekstep.content-collection',
      status: 'Draft',
      visibility: 'Default',
      channel: 'devChannel',
      framework: 'NCF',
      description: 'A sample question set for development',
      children: [
        {
          identifier: 'section-001',
          name: 'Section 1: Algebra',
          objectType: 'QuestionSet',
          primaryCategory: 'Question Set',
          mimeType: 'application/vnd.ekstep.content-collection',
          visibility: 'Parent',
          status: 'Draft',
          children: [
            {
              identifier: 'question-mcq-001',
              name: 'What is 2 + 2?',
              objectType: 'Question',
              primaryCategory: 'Multiple Choice Question',
              mimeType: 'application/vnd.sunbird.question',
              visibility: 'Parent',
              status: 'Draft',
              questionType: 'mcq',
              body: '<p>What is 2 + 2?</p>',
              editorState: { question: '<p>What is 2 + 2?</p>' },
              children: [],
            },
            {
              identifier: 'question-ftb-001',
              name: 'Fill in the blank: The capital of France is ___.',
              objectType: 'Question',
              primaryCategory: 'Fill in the Blanks',
              mimeType: 'application/vnd.sunbird.question',
              visibility: 'Parent',
              status: 'Draft',
              questionType: 'ftb',
              body: '<p>The capital of France is {{blank}}.</p>',
              children: [],
            },
          ],
        },
        {
          identifier: 'section-002',
          name: 'Section 2: General Science',
          objectType: 'QuestionSet',
          primaryCategory: 'Question Set',
          mimeType: 'application/vnd.ekstep.content-collection',
          visibility: 'Parent',
          status: 'Draft',
          children: [
            {
              identifier: 'question-sa-001',
              name: 'Explain photosynthesis in your own words.',
              objectType: 'Question',
              primaryCategory: 'Subjective Question',
              mimeType: 'application/vnd.sunbird.question',
              visibility: 'Parent',
              status: 'Draft',
              questionType: 'sa',
              body: '<p>Explain photosynthesis in your own words.</p>',
              children: [],
            },
            {
              identifier: 'question-slider-001',
              name: 'Rate your understanding on a scale of 1-5',
              objectType: 'Question',
              primaryCategory: 'Slider Question',
              mimeType: 'application/vnd.sunbird.question',
              visibility: 'Parent',
              status: 'Draft',
              questionType: 'slider',
              body: '<p>Rate your understanding on a scale of 1-5</p>',
              children: [],
            },
          ],
        },
      ],
    },
  },
};

export const MOCK_CATEGORY_DEFINITION = {
  responseCode: 'OK',
  result: {
    objectCategoryDefinition: {
      identifier: 'obj-cat:practice-question-set',
      name: 'Practice Question Set',
      objectMetadata: {
        config: {
          frameworkMetadata: { orgFWType: ['K-12'], targetFWType: ['K-12'] },
          sourcingSettings: {},
        },
        schema: { properties: { generateDIALCodes: { type: 'string', default: 'No' } } },
      },
      forms: {
        create: {
          properties: [
            {
              name: 'Details',
              fields: [
                { code: 'name',            label: 'Name',         inputType: 'text',     required: true,  editable: true,  visible: true, index: 1 },
                { code: 'primaryCategory', label: 'Type',         inputType: 'text',     required: false, editable: false, visible: true, index: 2 },
                { code: 'description',     label: 'Description',  inputType: 'textarea', required: true,  editable: true,  visible: true, index: 3 },
                { code: 'keywords',        label: 'Keywords',     inputType: 'keywords', required: false, editable: true,  visible: true, index: 4 },
                { code: 'instructions',    label: 'Instructions', inputType: 'textarea', required: false, editable: true,  visible: true, index: 5, placeholder: 'Enter instructions for the learner…' },
              ],
            },
            {
              name: 'Audience & Curriculum',
              fields: [
                { code: 'audience',   label: 'Audience Type',   inputType: 'select',      required: false, editable: true, visible: true, enum: ['Student', 'Teacher'], index: 1, section: 'Audience & Curriculum', placeholder: 'Select…' },
                { code: 'board',      label: 'Board / Syllabus',inputType: 'select',      required: true,  editable: true, visible: true, sourceCategory: 'board',      index: 2, section: 'Audience & Curriculum', placeholder: 'Select…' },
                { code: 'medium',     label: 'Medium(s)',       inputType: 'multiselect', required: true,  editable: true, visible: true, sourceCategory: 'medium',     index: 3, section: 'Audience & Curriculum', placeholder: 'Select…' },
                { code: 'gradeLevel', label: 'Class(es)',       inputType: 'multiselect', required: true,  editable: true, visible: true, sourceCategory: 'gradeLevel', index: 4, section: 'Audience & Curriculum', placeholder: 'Select…' },
                { code: 'subject',    label: 'Subject(s)',      inputType: 'multiselect', required: true,  editable: true, visible: true, sourceCategory: 'subject',    index: 5, section: 'Audience & Curriculum', placeholder: 'Select…' },
              ],
            },
            {
              name: 'Licensing',
              fields: [
                { code: 'license',       label: 'License',        inputType: 'select', required: false, editable: true, visible: true, enum: ['CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0'], index: 1, section: 'Licensing' },
                { code: 'copyright',     label: 'Copyright',      inputType: 'text',   required: false, editable: true, visible: true, index: 2, section: 'Licensing' },
                { code: 'copyrightYear', label: 'Copyright Year', inputType: 'text',   required: false, editable: true, visible: true, index: 3, section: 'Licensing' },
              ],
            },
          ],
        },
        unitMetadata: {
          properties: [
            { code: 'name',         label: 'Section Title', inputType: 'text',     required: true,  editable: true, visible: true, index: 1, span: 'full' },
            { code: 'description',  label: 'Description',   inputType: 'textarea', required: false, editable: true, visible: true, index: 2 },
            { code: 'instructions', label: 'Instructions',  inputType: 'textarea', required: false, editable: true, visible: true, index: 3, placeholder: 'Enter instructions for this section…' },
          ],
        },
        childMetadata: {
          properties: [
            { code: 'name',           label: 'Question Title',  inputType: 'text',   required: false, editable: true, visible: true, index: 1 },
            { code: 'difficultyLevel',label: 'Difficulty Level',inputType: 'select', required: false, editable: true, visible: true, enum: ['easy', 'medium', 'hard'], index: 2 },
            { code: 'bloomsLevel',    label: "Bloom's Level",   inputType: 'select', required: false, editable: true, visible: true, enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], index: 3 },
            { code: 'maxScore',       label: 'Max Score',       inputType: 'text',   required: false, editable: true, visible: true, index: 4 },
          ],
        },
        searchConfig: {
          properties: [
            { code: 'difficultyLevel', label: 'Difficulty',   inputType: 'select', required: false, editable: true, visible: true, enum: ['easy', 'medium', 'hard'], index: 1 },
            { code: 'bloomsLevel',     label: "Bloom's Level",inputType: 'select', required: false, editable: true, visible: true, enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], index: 2 },
          ],
        },
      },
    },
  },
};

export const MOCK_QUESTION_LIST = {
  responseCode: 'OK',
  result: {
    count: 3,
    Question: [
      { identifier: 'question-mcq-001', name: 'What is 2 + 2?',          primaryCategory: 'Multiple Choice Question', questionType: 'mcq', status: 'Live', difficultyLevel: 'easy' },
      { identifier: 'question-ftb-001', name: 'Capital of France is ___', primaryCategory: 'Fill in the Blanks',       questionType: 'ftb', status: 'Live', difficultyLevel: 'easy' },
      { identifier: 'question-sa-001',  name: 'Explain photosynthesis',   primaryCategory: 'Subjective Question',      questionType: 'sa',  status: 'Live', difficultyLevel: 'medium' },
    ],
  },
};

// question/v2/read responses in the OLD editor's persisted shape —
// editorState options as {answer, value:{body,value}}, responseDeclaration
// with correctResponse, solutions array, outcomeDeclaration maxScore.
export const MOCK_QUESTION_READ: Record<string, Record<string, unknown>> = {
  'question-mcq-001': {
    identifier: 'question-mcq-001',
    name: 'What is 2 + 2?',
    primaryCategory: 'Multiple Choice Question',
    mimeType: 'application/vnd.sunbird.question',
    qType: 'MCQ',
    interactionTypes: ['choice'],
    body: "<div class='question-body'><div class='mcq-title'><p>What is 2 + 2?</p></div><div data-choice-interaction='response1' class='mcq-vertical'></div></div>",
    editorState: {
      question: '<p>What is 2 + 2?</p>',
      options: [
        { answer: false, value: { body: '<p>3</p>', value: 0 } },
        { answer: true,  value: { body: '<p>4</p>', value: 1 } },
        { answer: false, value: { body: '<p>5</p>', value: 2 } },
        { answer: false, value: { body: '<p>22</p>', value: 3 } },
      ],
    },
    interactions: {
      response1: {
        type: 'choice',
        options: [
          { label: { en: '<p>3</p>' }, value: 0, hint: '' },
          { label: { en: '<p>4</p>' }, value: 1, hint: '' },
          { label: { en: '<p>5</p>' }, value: 2, hint: '' },
          { label: { en: '<p>22</p>' }, value: 3, hint: '' },
        ],
        validation: { required: 'Yes' },
      },
    },
    responseDeclaration: {
      response1: {
        cardinality: 'single', type: 'integer',
        correctResponse: { value: 1 },
        mapping: [{ value: 1, score: 1 }],
      },
    },
    outcomeDeclaration: { maxScore: { cardinality: 'single', type: 'integer', defaultValue: 1 } },
    solutions: [{ id: 'sol-1', type: 'html', value: '<p>2 + 2 = 4</p>' }],
    media: [],
    isPartialScore: false,
    evalUnordered: false,
  },
  'question-ftb-001': {
    identifier: 'question-ftb-001',
    name: 'Fill in the blank: The capital of France is ___.',
    primaryCategory: 'Fill in the Blanks',
    mimeType: 'application/vnd.sunbird.question',
    qType: 'FTB',
    interactionTypes: ['text'],
    body: '<p>The capital of France is [[Paris]].</p>',
    editorState: { question: '<p>The capital of France is [[Paris]].</p>' },
    outcomeDeclaration: { maxScore: { cardinality: 'single', type: 'integer', defaultValue: 1 } },
    solutions: [],
    media: [],
  },
  'question-sa-001': {
    identifier: 'question-sa-001',
    name: 'Explain photosynthesis in your own words.',
    primaryCategory: 'Subjective Question',
    mimeType: 'application/vnd.sunbird.question',
    qType: 'SA',
    interactionTypes: [],
    body: '<p>Explain photosynthesis in your own words.</p>',
    editorState: { question: '<p>Explain photosynthesis in your own words.</p>' },
    outcomeDeclaration: { maxScore: { cardinality: 'single', type: 'integer', defaultValue: 5 } },
    solutions: [{ id: 'sol-2', type: 'html', value: '<p>Plants convert light into chemical energy.</p>' }],
    media: [],
  },
};

export const MOCK_FRAMEWORK = {
  responseCode: 'OK',
  result: {
    framework: {
      identifier: 'NCF', name: 'NCF',
      categories: [
        { identifier: 'board',      code: 'board',      name: 'Board',   terms: [{ identifier: 'cbse', code: 'cbse', name: 'CBSE' }, { identifier: 'icse', code: 'icse', name: 'ICSE' }, { identifier: 'state', code: 'state', name: 'State Board' }] },
        { identifier: 'medium',     code: 'medium',     name: 'Medium',  terms: [{ identifier: 'english', code: 'english', name: 'English' }, { identifier: 'hindi', code: 'hindi', name: 'Hindi' }, { identifier: 'tamil', code: 'tamil', name: 'Tamil' }, { identifier: 'telugu', code: 'telugu', name: 'Telugu' }] },
        { identifier: 'gradeLevel', code: 'gradeLevel', name: 'Grade',   terms: Array.from({ length: 10 }, (_, i) => ({ identifier: `class${i + 1}`, code: `class${i + 1}`, name: `Class ${i + 1}` })) },
        { identifier: 'subject',    code: 'subject',    name: 'Subject', terms: [{ identifier: 'mathematics', code: 'mathematics', name: 'Mathematics' }, { identifier: 'science', code: 'science', name: 'Science' }, { identifier: 'english', code: 'english', name: 'English' }, { identifier: 'socialscience', code: 'socialscience', name: 'Social Science' }, { identifier: 'hindi', code: 'hindi', name: 'Hindi' }, { identifier: 'physics', code: 'physics', name: 'Physics' }, { identifier: 'chemistry', code: 'chemistry', name: 'Chemistry' }, { identifier: 'biology', code: 'biology', name: 'Biology' }] },
      ],
    },
  },
};

export const MOCK_CHANNEL = {
  responseCode: 'OK',
  result: { channel: { identifier: 'devChannel', name: 'Dev Channel', defaultLicense: 'CC BY 4.0' } },
};
