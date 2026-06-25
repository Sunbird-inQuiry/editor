import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { existsSync } from 'fs';
import type { Plugin, Connect } from 'vite';
import type { ServerResponse } from 'http';

// ---------------------------------------------------------------------------
// Mock API data — returned in dev when no real backend is present
// ---------------------------------------------------------------------------

const MOCK_QUESTIONSET_ID = 'do_test_questionset_001';

const MOCK_HIERARCHY = {
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

const MOCK_CATEGORY_DEFINITION = {
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
        schema: {
          properties: {
            generateDIALCodes: { type: 'string', default: 'No' },
          },
        },
      },
      forms: {
        create: {
          properties: [
            {
              name: 'Details',
              fields: [
                { code: 'name', label: 'Title', inputType: 'text', required: true, editable: true, visible: true, index: 1 },
                { code: 'description', label: 'Description', inputType: 'textarea', required: false, editable: true, visible: true, index: 2 },
                { code: 'keywords', label: 'Keywords', inputType: 'keywords', required: false, editable: true, visible: true, index: 3 },
              ],
            },
            {
              name: 'Audience & Curriculum',
              fields: [
                { code: 'board', label: 'Board', inputType: 'select', required: false, editable: true, visible: true, sourceCategory: 'board', index: 1, section: 'Audience & Curriculum' },
                { code: 'medium', label: 'Medium', inputType: 'multiselect', required: false, editable: true, visible: true, sourceCategory: 'medium', index: 2, section: 'Audience & Curriculum' },
                { code: 'gradeLevel', label: 'Grade', inputType: 'multiselect', required: false, editable: true, visible: true, sourceCategory: 'gradeLevel', index: 3, section: 'Audience & Curriculum' },
                { code: 'subject', label: 'Subject', inputType: 'multiselect', required: false, editable: true, visible: true, sourceCategory: 'subject', index: 4, section: 'Audience & Curriculum' },
              ],
            },
            {
              name: 'Licensing',
              fields: [
                { code: 'license', label: 'License', inputType: 'select', required: false, editable: true, visible: true, enum: ['CC BY 4.0', 'CC BY-SA 4.0', 'CC BY-NC 4.0'], index: 1, section: 'Licensing' },
                { code: 'copyright', label: 'Copyright', inputType: 'text', required: false, editable: true, visible: true, index: 2, section: 'Licensing' },
                { code: 'copyrightYear', label: 'Copyright Year', inputType: 'text', required: false, editable: true, visible: true, index: 3, section: 'Licensing' },
              ],
            },
          ],
        },
        unitMetadata: {
          properties: [
            { code: 'name', label: 'Section Title', inputType: 'text', required: true, editable: true, visible: true, index: 1 },
            { code: 'description', label: 'Description', inputType: 'textarea', required: false, editable: true, visible: true, index: 2 },
          ],
        },
        childMetadata: {
          properties: [
            { code: 'name', label: 'Question Title', inputType: 'text', required: false, editable: true, visible: true, index: 1 },
            { code: 'difficultyLevel', label: 'Difficulty Level', inputType: 'select', required: false, editable: true, visible: true, enum: ['easy', 'medium', 'hard'], index: 2 },
            { code: 'bloomsLevel', label: "Bloom's Level", inputType: 'select', required: false, editable: true, visible: true, enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], index: 3 },
            { code: 'maxScore', label: 'Max Score', inputType: 'text', required: false, editable: true, visible: true, index: 4 },
          ],
        },
        searchConfig: {
          properties: [
            { code: 'difficultyLevel', label: 'Difficulty', inputType: 'select', required: false, editable: true, visible: true, enum: ['easy', 'medium', 'hard'], index: 1 },
            { code: 'bloomsLevel', label: "Bloom's Level", inputType: 'select', required: false, editable: true, visible: true, enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], index: 2 },
          ],
        },
      },
    },
  },
};

const MOCK_QUESTION_LIST = {
  responseCode: 'OK',
  result: {
    count: 3,
    Question: [
      { identifier: 'question-mcq-001', name: 'What is 2 + 2?', primaryCategory: 'Multiple Choice Question', questionType: 'mcq', status: 'Live', difficultyLevel: 'easy' },
      { identifier: 'question-ftb-001', name: 'Capital of France is ___', primaryCategory: 'Fill in the Blanks', questionType: 'ftb', status: 'Live', difficultyLevel: 'easy' },
      { identifier: 'question-sa-001', name: 'Explain photosynthesis', primaryCategory: 'Subjective Question', questionType: 'sa', status: 'Live', difficultyLevel: 'medium' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Vite mock middleware plugin
// ---------------------------------------------------------------------------

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api',
    configureServer(server) {
      server.middlewares.use((req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const url = req.url ?? '';

        function json(data: unknown, status = 200) {
          res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify(data));
        }

        // QuestionSet hierarchy
        if (url.includes('/action/questionset/v1/hierarchy/')) {
          return json(MOCK_HIERARCHY);
        }

        // Category definition
        if (url.includes('/action/object/category/definition') || url.includes('/object/category/definition')) {
          return json(MOCK_CATEGORY_DEFINITION);
        }

        // Question hierarchy update (PATCH) — return success
        if (url.includes('/action/questionset/v1/hierarchy/update') && req.method === 'PATCH') {
          return json({ responseCode: 'OK', result: { identifier: MOCK_QUESTIONSET_ID } });
        }

        // Asset create — must come before composite/v3/search to avoid URL conflicts
        if (url.includes('/action/asset/v1/create') && req.method === 'POST') {
          return json({ responseCode: 'OK', result: { identifier: 'asset-' + Date.now(), versionKey: '1' } });
        }

        // Asset upload finalize
        if (url.includes('/action/asset/v1/upload/')) {
          return json({ responseCode: 'OK', result: { content_url: 'https://via.placeholder.com/400x300.png?text=Uploaded+Image' } });
        }

        // Pre-signed URL for upload
        if (url.includes('/action/content/v3/upload/url/')) {
          return json({ responseCode: 'OK', result: { preSignedUrl: 'https://mock-storage.example.com/upload', url: 'https://mock-storage.example.com/asset' } });
        }

        // Asset search (composite search for assets)
        if (url.includes('/action/composite/v3/search') && req.method === 'POST') {
          return json({ responseCode: 'OK', result: { count: 0, content: [] } });
        }

        // Question search / list
        if (url.includes('/action/question/v1/list')) {
          return json(MOCK_QUESTION_LIST);
        }

        // Question create
        if (url.includes('/action/question/v1/create') && req.method === 'POST') {
          return json({ responseCode: 'OK', result: { question: { identifier: 'question-new-' + Date.now(), name: 'New Question' } } });
        }

        // Question update
        if (url.match(/\/action\/question\/v1\/update\//) && req.method === 'PATCH') {
          return json({ responseCode: 'OK', result: {} });
        }

        // Comments read/write
        if (url.includes('/action/questionset/v1/comment/')) {
          if (req.method === 'GET') {
            return json({ responseCode: 'OK', result: { content: [] } });
          }
          return json({ responseCode: 'OK', result: {} });
        }

        // Review / publish / reject
        if (url.includes('/action/questionset/v1/review/') || url.includes('/action/questionset/v1/publish/') || url.includes('/action/questionset/v1/reject/')) {
          return json({ responseCode: 'OK', result: { identifier: MOCK_QUESTIONSET_ID } });
        }

        // Framework
        if (url.includes('/api/framework/v1/read/')) {
          return json({ responseCode: 'OK', result: { framework: { identifier: 'NCF', name: 'NCF', categories: [
            {
              identifier: 'board', code: 'board', name: 'Board',
              terms: [
                { identifier: 'cbse', code: 'cbse', name: 'CBSE' },
                { identifier: 'icse', code: 'icse', name: 'ICSE' },
                { identifier: 'state', code: 'state', name: 'State Board' },
              ],
            },
            {
              identifier: 'medium', code: 'medium', name: 'Medium',
              terms: [
                { identifier: 'english', code: 'english', name: 'English' },
                { identifier: 'hindi', code: 'hindi', name: 'Hindi' },
                { identifier: 'tamil', code: 'tamil', name: 'Tamil' },
                { identifier: 'telugu', code: 'telugu', name: 'Telugu' },
              ],
            },
            {
              identifier: 'gradeLevel', code: 'gradeLevel', name: 'Grade',
              terms: [
                { identifier: 'class1', code: 'class1', name: 'Class 1' },
                { identifier: 'class2', code: 'class2', name: 'Class 2' },
                { identifier: 'class3', code: 'class3', name: 'Class 3' },
                { identifier: 'class4', code: 'class4', name: 'Class 4' },
                { identifier: 'class5', code: 'class5', name: 'Class 5' },
                { identifier: 'class6', code: 'class6', name: 'Class 6' },
                { identifier: 'class7', code: 'class7', name: 'Class 7' },
                { identifier: 'class8', code: 'class8', name: 'Class 8' },
                { identifier: 'class9', code: 'class9', name: 'Class 9' },
                { identifier: 'class10', code: 'class10', name: 'Class 10' },
              ],
            },
            {
              identifier: 'subject', code: 'subject', name: 'Subject',
              terms: [
                { identifier: 'mathematics', code: 'mathematics', name: 'Mathematics' },
                { identifier: 'science', code: 'science', name: 'Science' },
                { identifier: 'english', code: 'english', name: 'English' },
                { identifier: 'socialscience', code: 'socialscience', name: 'Social Science' },
                { identifier: 'hindi', code: 'hindi', name: 'Hindi' },
                { identifier: 'physics', code: 'physics', name: 'Physics' },
                { identifier: 'chemistry', code: 'chemistry', name: 'Chemistry' },
                { identifier: 'biology', code: 'biology', name: 'Biology' },
              ],
            },
          ] } } });
        }

        // Channel
        if (url.includes('/api/channel/v1/read/')) {
          return json({ responseCode: 'OK', result: { channel: { identifier: 'devChannel', name: 'Dev Channel', defaultLicense: 'CC BY 4.0' } } });
        }

        next();
      });
    },
  };
}

// ---------------------------------------------------------------------------
// Vite config
// ---------------------------------------------------------------------------

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ['src'] }),
    mockApiPlugin(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'QuestionsetEditorReact',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format) =>
        format === 'umd'
          ? 'questionset-editor.umd.js'
          : format === 'es'
          ? 'index.js'
          : 'index.cjs',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  server: {
    port: 5174,
    proxy: {
      // Only proxy to real backends when mock middleware doesn't match.
      // These are no-ops in offline dev — mock plugin answers first.
      '/action/object/category/definition': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/action/, ''),
      },
      '/action': { target: 'http://localhost:3000', changeOrigin: true },
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/content': { target: 'http://localhost:3000', changeOrigin: true },
      '/sunbird-plugins': { target: 'http://localhost:3000', changeOrigin: true },
      '/assets': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req) => {
          const url = (req.url ?? '').split('?')[0];
          if (existsSync(resolve(__dirname, 'public' + url))) return url;
          return undefined;
        },
      },
      '/learner': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ['@tiptap/extension-mathematics', 'katex'],
  },
});
