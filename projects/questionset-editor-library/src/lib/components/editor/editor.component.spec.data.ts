import { IEditorConfig } from '../../interfaces/editor';
export let editorConfig: IEditorConfig | undefined;
// tslint:disable-next-line:variable-name
export let editorConfig_question: IEditorConfig | undefined;

editorConfig = {
  context: {
    programId: 'f72ad8b0-36df-11ec-a56f-4b503455085f',
    contributionOrgId: '',
    user: {
      id: '5a587cc1-e018-4859-a0a8-e842650b9d64',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      orgIds: ['01309282781705830427']
    },
    identifier: 'do_2138624108252774401216',
    authToken: ' ',
    sid: 'iYO2K6dOSdA0rwq7NeT1TDzS-dbqduvV',
    did: '7e85b4967aebd6704ba1f604f20056b6',
    uid: 'bf020396-0d7b-436f-ae9f-869c6780fc45',
    channel: '01309282781705830427',
    pdata: {
      id: 'dev.dock.portal',
      ver: '2.8.0',
      pid: 'creation-portal'
    },
    contextRollup: {
      l1: '01307938306521497658',
    },
    tags: ['01307938306521497658'],
    cdata: [
      {
        id: '01307938306521497658',
        type: 'sourcing_organization',
      },
      {
        type: 'project',
        id: 'ec5cc850-3f71-11eb-aae1-fb99d9fb6737',
      },
      {
        type: 'linked_collection',
        id: 'do_113140468925825024117'
      }
    ],
    timeDiff: 5,
    objectRollup: {
      l1: 'do_113140468925825024117',
      l2: 'do_113140468926914560125'
    },
    host: 'https://dev.inquiry.sunbird.org',
    defaultLicense: 'CC BY 4.0',
    endpoint: '/data/v3/telemetry',
    env: 'questionset_editor',
    framework: 'inquiry_k-12',
    cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
                      'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/', 'https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/'],
    board: 'CBSE',
    medium: ['English'],
    gradeLevel: ['Class 1'],
    subject: ['Hindi'],
    additionalCategories: [
      {
        value: 'Classroom Teaching Video',
        label: 'Classroom Teaching Video'
      },
      {
        value: 'Concept Map',
        label: 'Concept Map'
      },
      {
        value: 'Curiosity Question Set',
        label: 'Curiosity Question Set'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
    },
    correctionComments: false,
    cloudStorage: {
      provider: 'azure',
      presigned_headers: {
        'x-ms-blob-type': 'BlockBlob'
      }
    }
  },
  config: {
    mode: 'edit',
    enableQuestionCreation: true,
    enableAddFromLibrary: true,
    editableFields: {
      sourcingreview: ['instructions'],
      orgreview: ['name', 'instructions', 'learningOutcome'],
      review: ['name', 'description'],
    },
    maxDepth: 1,
    objectType: 'QuestionSet',
    primaryCategory: 'Practice Question Set',
    isRoot: true,
    iconClass: 'fa fa-book',
    hideSubmitForReviewBtn: false,
    children: {
      Question: [
        'Multiple Choice Question',
        'Subjective Question'
      ]
    },
    addFromLibrary: false,
    hierarchy: {
      "level1": {
          "name": "Section",
          "type": "Unit",
          "mimeType": "application/vnd.sunbird.questionset",
          "primaryCategory": "Practice Question Set",
          "iconClass": "fa fa-folder-o",
          "children": {
              "Question": [
                  "Multiple Choice Question",
                  "Subjective Question"
              ]
          }
      }
    },
    contentPolicyUrl: '/term-of-use.html',
    assetProxyUrl: '/assets/public/',
    commonFrameworkLicenseUrl: 'https://creativecommons.org/licenses/'
  }
};

editorConfig_question = {
  context: {
    channel: '01309282781705830427',
    authToken: '',
    sid: 'c4hzzUJYlbfLPoN2meEF6QfF3V_9o5Us',
    did: '6539921a5736199d5e1ff5b923776c23',
    uid: 'ae94b68c-a535-4dce-8e7a-fb9662b0ad68',
    programId: 'f09a30f0-5e34-11ec-874d-3de2a8c29d94',
    contributionOrgId: 'e7328d77-42a7-44c8-84f4-8cfea235f07d',
    identifier: 'do_113274017771085824116',
    pdata: {
      id: 'local.sunbird.portal',
      ver: '2.8.0',
      pid: 'sunbird-portal',
    },
    actor: {
      id: 'ae94b68c-a535-4dce-8e7a-fb9662b0ad68',
      type: 'User',
    },
    contextRollup: {
      l1: '01309282781705830427',
    },
    tags: ['01309282781705830427', '01309282781705830427'],
    timeDiff: -0.877,
    endpoint: '/data/v3/telemetry',
    env: 'question_editor',
    user: {
      id: 'ae94b68c-a535-4dce-8e7a-fb9662b0ad68',
      orgIds: ['01309282781705830427'],
      organisations: {
        '01309282781705830427': 'NIT',
      },
      fullName: 'N150',
      firstName: 'N150',
      lastName: '',
      isRootOrgAdmin: false,
    },
    targetFWIds: ['nit_k-12'],
    channelData: {
      code: '01309282781705830427',
      frameworks: [],
      channel: 'in.ekstep',
      description: 'Preprod Kayal Org',
      createdOn: '2020-08-24T05:00:51.381+0000',
      objectType: 'Channel',
      collectionPrimaryCategories: [
        'Content Playlist',
        'Course',
        'Digital Textbook',
        'Question paper',
      ],
      appId: '@ignore@',
      primaryCategories: [],
      additionalCategories: [
        'DigitalCourse',
        'DigitalCourse1',
        'DigitalCourse2',
        'Exam Question Set',
        'LearningPath1',
        'Observation',
        'Survey',
        'Text Asset',
        'Video transcript',
      ],
      lastUpdatedOn: '2021-04-09T13:43:13.465+0000',
      collectionAdditionalCategories: ['Textbook', 'Lesson Plan'],
      contentAdditionalCategories: [
        'Classroom Teaching Video',
        'Concept Map',
        'Curiosity Question Set',
        'Experiential Resource',
        'Explanation Video',
        'Focus Spot',
        'Learning Outcome Definition',
        'Lesson Plan',
        'Marking Scheme Rubric',
        'Pedagogy Flow',
        'Previous Board Exam Papers',
        'TV Lesson',
        'Textbook',
      ],
      apoc_num: 1,
      identifier: '01309282781705830427',
      lastStatusChangedOn: '2020-08-24T05:00:51.381+0000',
      consumerId: '7411b6bd-89f3-40ec-98d1-229dc64ce77d',
      assetAdditionalCategories: [],
      languageCode: [],
      versionKey: '1617975793465',
      contentPrimaryCategories: [
        'Course Assessment',
        'eTextbook',
        'Explanation Content',
        'Learning Resource',
        'Practice Question Set',
        'Teacher Resource',
        'Exam Question',
      ],
      name: 'NIT123',
      defaultCourseFramework: 'TPD',
      assetPrimaryCategories: ['Asset', 'CertAsset', 'Certificate Template'],
      status: 'Live',
      defaultFramework: 'ekstep_ncert_k-12',
    },
    labels: {
      submit_collection_btn_label: 'Submit for review',
      publish_collection_btn_label: 'Submit for Approval',
      sourcing_approve_collection_btn_label: 'Publish',
      reject_collection_btn_label: 'Request changes',
    },
    framework: 'ekstep_ncert_k-12',
    correctionComments: '',
    sourcingResourceStatus: 'Draft',
    sourcingResourceStatusClass: 'sb-color-gray-300',
    collectionIdentifier: 'do_113431883451195392169',
    unitIdentifier: 'do_113431884671442944170',
    collectionObjectType: 'QuestionSet',
    collectionPrimaryCategory: 'Exam Question Set',
  },
  config: {
    primaryCategory: 'Subjective Question',
    objectType: 'Question',
    mode: 'edit',
    setDefaultCopyRight: false,
    showOriginPreviewUrl: false,
    showSourcingStatus: false,
    showCorrectionComments: false,
    hideSubmitForReviewBtn: false,
    questionSet: {
      maxQuestionsLimit: 500,
    },
    createdByField: 'board',
    editableFields: {
      orgreview: ['name', 'learningOutcome'],
      sourcingreview: ['name', 'learningOutcome'],
    },
    mimeType: 'application/vnd.sunbird.question',
    isReadOnlyMode: false,
    interactionType: 'default',
    questionCategory: 'VSA',
    questionPrimaryCategories: ['Multiple Choice Question', 'Subjective Question']
  },
};

export const toolbarConfig_question = {
  preview_collection_btn_label: 'Preview',
  preview_collection_btn_icon: 'icon eye',
  save_collection_btn_label: 'Save as Draft',
  save_collection_btn_icon: '',
  submit_collection_btn_label: 'Submit for review',
  submit_collection_btn_icon: '',
  reject_collection_btn_label: 'Request changes',
  reject_collection_btn_icon: '',
  publish_collection_btn_label: 'Submit for Approval',
  publish_collection_btn_icon: '',
  edit_question_btn_label: 'Edit',
  edit_question_btn_icon: 'icon edit',
  preview_question_btn_label: 'Preview',
  preview_question_btn_icon: 'icon eye',
  cancel_question_btn_label: 'Cancel',
  cancel_question_btn_icon: '',
  save_question_btn_label: 'Save',
  save_question_btn_icon: '',
  send_back_for_correction_collection_btn_label: 'Send Back For Corrections',
  send_back_for_correction_collection_btn_icon: '',
  sourcing_approve_collection_btn_label: 'Publish',
  sourcing_approve_collection_btn_icon: '',
  sourcing_reject_collection_btn_label: 'Reject',
  sourcing_reject_collection_btn_icon: '',
  upload_use_btn_label: 'Upload and Use',
  cancel_btn_label: 'Cancel',
  back_btn_label: 'Back',
  search_btn_label: 'Search',
  add_btn_label: 'Add',
  upload_from_computer_btn_label: 'Upload from Computer',
  request_btn_label: 'Request',
  no_btn_label: 'No',
  yes_btn_label: 'Yes',
  close_btn_label: 'Close',
  submit_btn_label: 'Submit',
  add_sibling_btn_label: 'Add Sibling',
  add_child_btn_label: 'Add Child',
  create_new_btn_label: 'Create New',
  add_from_library_btn_label: ' Add from library',
  submit_review_btn_label: 'Submit Review',
  apply_btn_label: 'Apply',
  reset_btn_label: 'Reset',
  delete_btn_label: 'Delete',
  next_btn_label: 'Next',
  remove_btn_label: 'Remove',
  done_btn_label: 'Done'
};

export const nativeElement = `<div><ul id="ft-id-1" class="ui-fancytree fancytree-container fancytree-plain fancytree-ext-glyph fancytree-ext-dnd5 fancytree-connectors" tabindex="0" role="tree" aria-multiselectable="true"><li role="treeitem" aria-expanded="false" aria-selected="false" class="fancytree-lastsib"><span class="fancytree-node fancytree-folder fancytree-has-children fancytree-lastsib fancytree-exp-cl fancytree-ico-cf" draggable="true"><span role="button" class="fancytree-expander fa fa-caret-right"></span><span role="presentation" class="fancytree-custom-icon fa fa-book"></span><span class="fancytree-title" title="SB23410q" style="width:15em;text-overflow:ellipsis;white-space:nowrap;overflow:hidden">SB23410q</span><span class="ui dropdown sb-dotted-dropdown" autoclose="itemClick" suidropdown="" tabindex="0" style="display: none;"> <span id="contextMenu" class="p-0 w-auto"><i class="icon ellipsis vertical sb-color-black"></i></span>
  <span id="contextMenuDropDown" class="menu transition hidden" suidropdownmenu="" style="">
    <div id="addchild" class="item">Add Child</div>
  </span>
  </span></span></li></ul></div>`;

export const getCategoryDefinitionResponse = {
  id: 'api.object.category.definition.read',
  ver: '3.0',
  ts: '2021-06-23T11:43:39ZZ',
  params: {
    resmsgid: '7efb262e-1b7e-44b7-8fe8-ceddc963cf47',
    msgid: null,
    err: null,
    status: 'successful',
    errmsg: null,
  },
  responseCode: 'OK',
  result: {
    objectCategoryDefinition: {
      identifier: 'obj-cat:multiple-choice-question_question_all',
      objectMetadata: {
        childrenConfig: {
          choice: {}
        },
        config: {
          maximumOptions: 4
        },
        schema: {
          properties: {
            mimeType: {
              type: 'string',
              enum: ['application/vnd.sunbird.question'],
            },
            interactionTypes: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['choice'],
              },
            },
          },
        },
      },
      label: 'Multiple Choice Question',
      languageCode: [],
      name: 'Multiple Choice Question',
      forms: {},
    },
  },
};

export const editorServiceSelectedChildren = {
  mimeType: 'application/vnd.sunbird.question',
  primaryCategory: 'Multiple Choice Question',
  interactionType: 'choice',
};

export const categoryDefinition = {
  result: {
    objectCategoryDefinition: {
      objectMetadata: {
        config: {
          maximumOptions:20
        },
      },
      forms: {
        unitMetadata: {
          properties: { code: 'name', editable: true },
        },
        create: {
          properties: [
            {
              name: 'Basic details',
              fields: [
                {
                  code: 'name',
                  name: 'Name',
                  label: 'Observation Name',
                  placeholder: 'Observation Name',
                  description: 'Observation Name',
                  dataType: 'text',
                  inputType: 'text',
                  editable: true,
                  required: true,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1 required',
                  },
                  validations: [
                    {
                      type: 'maxLength',
                      value: '120',
                      message: 'Entered name is too long',
                    },
                    {
                      type: 'required',
                      message: 'Name is required',
                    },
                  ],
                },
                {
                  code: 'entityType',
                  dataType: 'text',
                  description:
                    'Select the entity i.e. district, block, cluster, schools for which the form is designed and is to be taken up. The users will be able to conduct observations for only the selected type of entities.',
                  editable: true,
                  inputType: 'select',
                  label: 'Entity Type',
                  name: 'entityType',
                  placeholder: 'Entity Type',
                  renderingHints: {
                    class: 'sb-g-col-lg-1 required',
                  },
                  required: true,
                  visible: true,
                  range: ['School', 'Block', 'Cluster', 'District'],
                  validations: [
                    {
                      type: 'required',
                      message: 'Name is required',
                    },
                  ],
                },
                {
                  code: 'keywords',
                  name: 'Keywords',
                  label: 'Keywords',
                  placeholder: 'Add Keywords',
                  description: 'Keywords for the Question Set',
                  dataType: 'list',
                  inputType: 'keywords',
                  editable: true,
                  required: false,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                },
                {
                  code: 'language',
                  name: 'Primary Language',
                  label: 'Select Language 1',
                  placeholder: 'Select Language 1',
                  description: 'Select Language 1',
                  default: ['English'],
                  dataType: 'list',
                  inputType: 'select',
                  editable: true,
                  output: 'label',
                  required: true,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1 required',
                  },
                  range: [
                    {
                      value: 'en',
                      label: 'English',
                    },
                    {
                      value: 'hi',
                      label: 'Hindi',
                    },
                    {
                      value: 'ur',
                      label: 'Urdu',
                    },
                  ],
                  validations: [
                    {
                      type: 'required',
                      message: 'Primary Language is required',
                    },
                  ],
                },
                {
                  code: 'audience',
                  dataType: 'list',
                  description: 'Suggested User Type',
                  editable: true,
                  inputType: 'nestedselect',
                  label: 'Suggested User Type',
                  name: 'userTypes',
                  placeholder: 'Suggested User Type',
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                  required: false,
                  visible: true,
                  range: [
                    'Audience1',
                    'Audience2',
                    'Audience3',
                    'Audience4',
                    'Audience5',
                    'Audience6',
                    'Audience7',
                  ],
                },
                {
                  code: 'description',
                  name: 'Description',
                  label: 'Description',
                  placeholder: 'Enter Description',
                  description: 'Description of the Question Set',
                  dataType: 'text',
                  inputType: 'textarea',
                  editable: true,
                  required: false,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                },
                {
                  code: 'allowScoring',
                  name: 'allowScoring',
                  label: 'Enable Scoring',
                  placeholder: 'Enable Scoring',
                  description:
                    'Select to enable the option of scoring for questions in the form. Score can be added to questions only if this is selected',
                  dataType: 'text',
                  inputType: 'checkbox',
                  editable: true,
                  required: false,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                },
                {
                  code: 'evidenceMimeType',
                  dataType: 'list',
                  depends: ['showEvidence'],
                  description: 'Evidence',
                  editable: true,
                  inputType: 'multiselect',
                  label: 'evidence',
                  name: 'evidenceMimeType',
                  placeholder: 'evidence',
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                  required: false,
                  visible: true,
                  range: [
                    {
                      value: 'image/png',
                      label: 'image/png',
                    },
                    { value: 'audio/mp3', label: 'audio/mp3' },
                    { value: 'video/mp4', label: 'video/mp4' },
                    { value: 'video/webm', label: 'video/webm' },
                  ],
                },
                {
                  code: 'ecm',
                  name: 'ECM',
                  depends: ['allowECM'],
                  label: 'Select ECM\'s',
                  placeholder: 'Select ECM\'s',
                  description: 'ECM for the Observation with rubrics',
                  dataType: 'list',
                  inputType: 'selectTextBox',
                  editable: true,
                  required: false,
                  visible: true,
                  renderingHints: {
                    class: 'sb-g-col-lg-1',
                  },
                  options: [
                    'Audience1 interview',
                    'Audience2 interview',
                    'Audience3 interview',
                    'Audience4 interview',
                    'Audience5 interview'
                  ],
                },
              ],
            },
          ],
        },
        search: {
          properties: { code: 'name', editable: true },
        },
        searchConfig: {
          properties: { code: 'name', editable: true },
        },
        childMetadata: {
          properties: { code: 'name', editable: true },
        },
        relationalMetadata: {
          properties: { code: 'name', editable: true },
        },
      },
      label: 'Multiple Choice Question',
    },
  },
};

export const hierarchyResponse = [
  {
    result: {
      "questionset": {
          "copyright": "NIT123",
          "previewUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/do_2138622515299368961170_html_1692594234677.html",
          "subject": [
              "Science"
          ],
          "channel": "01309282781705830427",
          "downloadUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/short-text-questionset_1692594234115_do_2138622515299368961170_2.ecar",
          "language": [
              "English"
          ],
          "mimeType": "application/vnd.sunbird.questionset",
          "showHints": false,
          "variants": {
              "spine": {
                  "ecarUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/short-text-questionset_1692594233994_do_2138622515299368961170_2_SPINE.ecar",
                  "size": "7499"
              },
              "online": {
                  "ecarUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/short-text-questionset_1692594234067_do_2138622515299368961170_2_ONLINE.ecar",
                  "size": "4304"
              },
              "full": {
                  "ecarUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/short-text-questionset_1692594234115_do_2138622515299368961170_2.ecar",
                  "size": "5812749"
              }
          },
          "objectType": "QuestionSet",
          "se_mediums": [
              "Hindi"
          ],
          "gradeLevel": [
              "Class 7"
          ],
          "appIcon": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/artifact/sunbird.thumb.jpeg",
          "primaryCategory": "Practice Question Set",
          "contentEncoding": "gzip",
          "generateDIALCodes": "No",
          "se_gradeLevels": [
              "Class 7"
          ],
          "showSolutions": false,
          "trackable": {
              "enabled": "No",
              "autoBatch": "No"
          },
          "identifier": "do_2138622515299368961170",
          "audience": [
              "Audience1"
          ],
          "visibility": "Default",
          "showTimer": true,
          "author": "Creator1",
          "consumerId": "6968004d-c67e-434a-a350-773aa1e068a3",
          "childNodes": [
              "do_2138622530437857281173",
              "do_2138622518926049281171",
              "do_2138622565343969281175"
          ],
          "lastPublishedBy": "ae94b68c-a535-4dce-8e7a-fb9662b0ad68",
          "languageCode": [
              "en"
          ],
          "se_subjects": [
              "Science"
          ],
          "license": "CC BY 4.0",
          "size": 5812749,
          "lastPublishedOn": "2023-08-21T05:03:53.848+0000",
          "name": "Short  Text Questionset",
          "allowBranching": "No",
          "status": "Live",
          "code": "7d5aaa70-ffb8-d062-ba10-1db445a11dbc",
          "allowSkip": "Yes",
          "containsUserData": "No",
          "qumlVersion": 1.1,
          "prevStatus": "Draft",
          "description": "Short  Text Questionset",
          "medium": [
              "Hindi"
          ],
          "posterImage": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/content/assets/do_2138623258587217921213/sunbird.jpeg",
          "createdOn": "2023-08-16T07:02:56.221+0000",
          "pdfUrl": "https://sunbirddevbbpublic.blob.core.windows.net/sunbird-content-staging/questionset/do_2138622515299368961170/do_2138622515299368961170_pdf_1692594234677.pdf",
          "se_boards": [
              "ICSE"
          ],
          "scoreCutoffType": "AssessmentLevel",
          "contentDisposition": "inline",
          "lastUpdatedOn": "2023-08-21T05:03:55.457+0000",
          "allowAnonymousAccess": "Yes",
          "lastStatusChangedOn": "2023-08-21T05:03:55.457+0000",
          "createdFor": [
              "01309282781705830427"
          ],
          "schemaVersion": "1.1",
          "requiresSubmit": "No",
          "summaryType": "Complete",
          "se_FWIds": [
              "inquiry_k-12"
          ],
          "setType": "materialised",
          "pkgVersion": 2,
          "versionKey": "1692188886715",
          "showFeedback": false,
          "framework": "inquiry_k-12",
          "depth": 0,
          "createdBy": "5a587cc1-e018-4859-a0a8-e842650b9d64",
          "compatibilityLevel": 5,
          "navigationMode": "non-linear",
          "timeLimits": {
              "questionSet": {
                  "max": 300,
                  "min": 0
              }
          },
          "shuffle": true,
          "board": "ICSE"
      }
    }
  }
];

export const categoryDefinitionData = {
  "id": "api.object.category.definition.read",
  "ver": "3.0",
  "ts": "2023-08-17T10:40:09ZZ",
  "params": {
      "resmsgid": "3e4697ae-f129-4a41-bd5a-b8f5b68b9c8c",
      "msgid": null,
      "err": null,
      "status": "successful",
      "errmsg": null
  },
  "responseCode": "OK",
  "result": {
      "objectCategoryDefinition": {
          "identifier": "obj-cat:practice-question-set_questionset_all",
          "objectMetadata": {
              "config": {
                  "frameworkMetadata": {
                    "orgFWType": ['K-12', 'TPD'],
                    "targetFWType": ['K-12'],
                  },
                  "sourcingSettings": {
                      "collection": {
                          "maxDepth": 1,
                          "addFromLibraryEnabled": true,
                          "enableAddFromLibrary": true,
                          "objectType": "QuestionSet",
                          "primaryCategory": "Practice Question Set",
                          "isRoot": true,
                          "iconClass": "fa fa-book",
                          "children": {},
                          "hierarchy": {
                              "level1": {
                                  "name": "Section",
                                  "type": "Unit",
                                  "mimeType": "application/vnd.sunbird.questionset",
                                  "primaryCategory": "Practice Question Set",
                                  "iconClass": "fa fa-folder-o",
                                  "children": {
                                      "Question": [
                                          "Multiple Choice Question",
                                          "Subjective Question"
                                      ]
                                  }
                              }
                          },
                          "questionSet": {
                              "maxQuestionsLimit": 5
                          }
                      }
                  }
              },
              "questionSet": {
                  "maxQuestionsLimit": 5
              },
              "schema": {
                  "properties": {
                      "mimeType": {
                          "type": "string",
                          "enum": [
                              "application/vnd.sunbird.questionset"
                          ]
                      },
                      "verticals": {
                          "type": "string",
                          "enum": [
                              "Nipun Bharat",
                              "Adult Education",
                              "Vocational Education",
                              "CWSN",
                              "Virtual Labs"
                          ]
                      }
                  }
              }
          },
          "languageCode": [],
          "name": "Practice Question Set",
          "forms": {
              "create": {
                  "templateName": "",
                  "required": [],
                  "properties": [
                      {
                          "name": "Basic details",
                          "fields": [
                              {
                                  "code": "appIcon",
                                  "name": "Icon",
                                  "label": "Icon",
                                  "placeholder": "Icon",
                                  "description": "Icon for the question set",
                                  "dataType": "text",
                                  "inputType": "appIcon",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  }
                              },
                              {
                                  "code": "name",
                                  "name": "Name",
                                  "label": "Name",
                                  "placeholder": "Name",
                                  "description": "Name of the QuestionSet",
                                  "dataType": "text",
                                  "inputType": "text",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "max",
                                          "value": "120",
                                          "message": "Input is Exceeded"
                                      },
                                      {
                                          "type": "required",
                                          "message": "Name is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "description",
                                  "name": "Description",
                                  "label": "Description",
                                  "placeholder": "Description",
                                  "description": "Description of the content",
                                  "dataType": "text",
                                  "inputType": "textarea",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "description is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "keywords",
                                  "name": "Keywords",
                                  "label": "keywords",
                                  "placeholder": "Enter Keywords",
                                  "description": "Keywords for the Question Set",
                                  "dataType": "list",
                                  "inputType": "keywords",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "instructions",
                                  "name": "Instructions",
                                  "label": "Instructions",
                                  "placeholder": "Enter Instructions",
                                  "description": "Instructions for the question set",
                                  "dataType": "text",
                                  "inputType": "richtext",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-2 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "maxLength",
                                          "value": "500",
                                          "message": "Input is Exceeded"
                                      }
                                  ]
                              },
                              {
                                  "code": "primaryCategory",
                                  "name": "Type",
                                  "label": "Type",
                                  "placeholder": "",
                                  "description": "Type or Category of the Question Set",
                                  "dataType": "text",
                                  "inputType": "text",
                                  "editable": false,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "additionalCategories",
                                  "name": "Additional Category",
                                  "label": "Additional Category",
                                  "placeholder": "Select Additional Category",
                                  "description": "Additonal Category of the Question Set",
                                  "default": "",
                                  "dataType": "list",
                                  "inputType": "nestedselect",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              }
                          ]
                      },
                      {
                          "name": "Framework details",
                          "fields": [
                              {
                                  "code": "board",
                                  "name": "Board/Syllabus",
                                  "label": "Board/Syllabus",
                                  "placeholder": "Select Board/Syllabus",
                                  "description": "Board or Syallbus of the Question Set",
                                  "default": "",
                                  "dataType": "text",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "depends": [],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Board is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "medium",
                                  "name": "Medium",
                                  "label": "Medium",
                                  "placeholder": "Select Medium",
                                  "description": "Medium of Instruction for the Question Set",
                                  "default": "",
                                  "dataType": "list",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "depends": [
                                      "board"
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Medium is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "gradeLevel",
                                  "name": "Class",
                                  "label": "Class",
                                  "placeholder": "Select Class",
                                  "description": "Class of the Question Set",
                                  "default": "",
                                  "dataType": "list",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "depends": [
                                      "board",
                                      "medium"
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Class is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "subject",
                                  "name": "Subject",
                                  "label": "Subject",
                                  "placeholder": "Select Subject",
                                  "description": "Subject of the Question Set",
                                  "default": "",
                                  "dataType": "list",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "depends": [
                                      "board",
                                      "medium",
                                      "gradeLevel"
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Subject is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "audience",
                                  "name": "Audience",
                                  "label": "Audience",
                                  "placeholder": "Select Audience",
                                  "description": "Audience of the Question Set",
                                  "dataType": "list",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "range": [
                                      "Audience1",
                                      "Audience2",
                                      "Audience3"
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Audience is required"
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "name": "Question set behaviour",
                          "fields": [
                              {
                                  "code": "maxTime",
                                  "name": "MaxTimer",
                                  "label": "Set Maximum Time",
                                  "placeholder": "HH:mm:ss",
                                  "description": "This is the maximum time allowed for the users to complete the assessment",
                                  "default": "3600",
                                  "dataType": "text",
                                  "inputType": "timer",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  },
                                  "validations": [
                                      {
                                          "type": "time",
                                          "message": "Please enter in hh:mm:ss",
                                          "value": "HH:mm:ss"
                                      },
                                      {
                                          "type": "max",
                                          "value": "05:59:59",
                                          "message": "max time should be less than 05:59:59"
                                      }
                                  ]
                              },
                              {
                                  "code": "showTimer",
                                  "name": "show Timer",
                                  "label": "show Timer",
                                  "placeholder": "show Timer",
                                  "description": "show Timer",
                                  "default": false,
                                  "dataType": "boolean",
                                  "inputType": "checkbox",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "requiresSubmit",
                                  "name": "Submit Confirmation",
                                  "label": "Submit Confirmation Page",
                                  "placeholder": "Select Submit Confirmation",
                                  "description": "Allows users to review and submit the assessment",
                                  "dataType": "text",
                                  "inputType": "select",
                                  "output": "identifier",
                                  "range": [
                                      {
                                          "identifier": "Yes",
                                          "label": "Enable"
                                      },
                                      {
                                          "identifier": "No",
                                          "label": "Disable"
                                      }
                                  ],
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "maxAttempts",
                                  "name": "Max Attempts",
                                  "label": "Max Attempts",
                                  "placeholder": "Max Attempts",
                                  "description": "Max Attempts",
                                  "dataType": "number",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "range": [
                                      1,
                                      2,
                                      3,
                                      4,
                                      5,
                                      6,
                                      7,
                                      8,
                                      9,
                                      10,
                                      11,
                                      12,
                                      13,
                                      14,
                                      15,
                                      16,
                                      17,
                                      18,
                                      19,
                                      20,
                                      21,
                                      22,
                                      23,
                                      24,
                                      25
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "summaryType",
                                  "name": "summaryType",
                                  "label": "Summary Type",
                                  "placeholder": "Select Summary Type",
                                  "description": "summaryType",
                                  "dataType": "text",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "range": [
                                      "Complete",
                                      "Score",
                                      "Duration",
                                      "Score & Duration"
                                  ],
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              }
                          ]
                      },
                      {
                          "name": "Question set behaviour",
                          "fields": [
                              {
                                  "code": "author",
                                  "name": "Author",
                                  "label": "Author",
                                  "placeholder": "Author",
                                  "description": "Author of the question set",
                                  "dataType": "text",
                                  "inputType": "text",
                                  "editable": true,
                                  "required": true,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1 required"
                                  },
                                  "validations": [
                                      {
                                          "type": "required",
                                          "message": "Author is required"
                                      }
                                  ]
                              },
                              {
                                  "code": "attributions",
                                  "name": "Attributions",
                                  "label": "Attributions",
                                  "placeholder": "Enter Attributions",
                                  "description": "Attributions of the question set",
                                  "dataType": "text",
                                  "inputType": "text",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "copyright",
                                  "name": "Copyright & year",
                                  "label": "Copyright & year",
                                  "placeholder": "Copyright & year",
                                  "description": "Copyright & year",
                                  "dataType": "text",
                                  "inputType": "text",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              },
                              {
                                  "code": "license",
                                  "name": "license",
                                  "label": "license",
                                  "placeholder": "Select license",
                                  "description": "license",
                                  "dataType": "text",
                                  "inputType": "select",
                                  "editable": true,
                                  "required": false,
                                  "visible": true,
                                  "range": "",
                                  "renderingHints": {
                                      "class": "sb-g-col-lg-1"
                                  }
                              }
                          ]
                      }
                  ]
              },
              "publish": {},
              "searchConfig": {
                  "templateName": "",
                  "required": [],
                  "properties": [
                      {
                          "code": "primaryCategory",
                          "dataType": "list",
                          "description": "Type",
                          "editable": true,
                          "default": [],
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          },
                          "inputType": "nestedselect",
                          "label": "Question Type(s)",
                          "name": "Type",
                          "placeholder": "Select QuestionType",
                          "required": false,
                          "visible": true
                      },
                      {
                          "code": "board",
                          "visible": true,
                          "depends": [],
                          "editable": true,
                          "dataType": "list",
                          "description": "Board",
                          "label": "Board",
                          "required": false,
                          "name": "Board",
                          "inputType": "select",
                          "placeholder": "Select Board",
                          "output": "name",
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      },
                      {
                          "code": "medium",
                          "visible": true,
                          "editable": true,
                          "dataType": "list",
                          "description": "",
                          "label": "Medium(s)",
                          "required": false,
                          "name": "Medium",
                          "inputType": "nestedselect",
                          "placeholder": "Select Medium",
                          "output": "name",
                          "depends": [
                              "board"
                          ],
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      },
                      {
                          "code": "gradeLevel",
                          "visible": true,
                          "depends": [
                              "board",
                              "medium"
                          ],
                          "editable": true,
                          "default": "",
                          "dataType": "list",
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          },
                          "description": "Class",
                          "label": "Class(es)",
                          "required": false,
                          "name": "Class",
                          "inputType": "nestedselect",
                          "placeholder": "Select Class",
                          "output": "name"
                      },
                      {
                          "code": "subject",
                          "visible": true,
                          "depends": [
                              "board",
                              "medium",
                              "gradeLevel"
                          ],
                          "editable": true,
                          "default": "",
                          "dataType": "list",
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          },
                          "description": "",
                          "label": "Subject(s)",
                          "required": false,
                          "name": "Subject",
                          "inputType": "nestedselect",
                          "placeholder": "Select Subject",
                          "output": "name"
                      }
                  ]
              },
              "unitMetadata": {
                  "templateName": "",
                  "required": [],
                  "properties": [
                      {
                          "code": "name",
                          "dataType": "text",
                          "description": "Name of the content",
                          "editable": true,
                          "inputType": "text",
                          "label": "Title",
                          "name": "Title",
                          "placeholder": "Title",
                          "renderingHints": {
                              "class": "sb-g-col-lg-1 required"
                          },
                          "required": true,
                          "visible": true,
                          "validations": [
                              {
                                  "type": "max",
                                  "value": "120",
                                  "message": "Input is Exceeded"
                              },
                              {
                                  "type": "required",
                                  "message": "Title is required"
                              }
                          ]
                      },
                      {
                          "code": "description",
                          "dataType": "text",
                          "description": "Description of the content",
                          "editable": true,
                          "inputType": "textarea",
                          "label": "Description",
                          "name": "Description",
                          "placeholder": "Description",
                          "renderingHints": {
                              "class": "sb-g-col-lg-1 required"
                          },
                          "required": true,
                          "visible": true,
                          "validations": [
                              {
                                  "type": "max",
                                  "value": "500",
                                  "message": "Input is Exceeded"
                              }
                          ]
                      },
                      {
                          "code": "instructions",
                          "name": "Instructions",
                          "label": "Instructions",
                          "placeholder": "Enter Instructions",
                          "description": "Instructions for the section",
                          "dataType": "text",
                          "inputType": "richtext",
                          "editable": true,
                          "required": false,
                          "visible": true,
                          "renderingHints": {
                              "class": "sb-g-col-lg-2"
                          },
                          "validations": [
                              {
                                  "type": "maxLength",
                                  "value": "500",
                                  "message": "Input is Exceeded"
                              }
                          ]
                      },
                      {
                          "code": "maxQuestions",
                          "name": "Show Questions",
                          "label": "Count of questions to be displayed in this section",
                          "placeholder": "Input count of questions to be displayed",
                          "description": "By default all questions are shown unless specific count is entered.",
                          "default": "",
                          "dataType": "number",
                          "inputType": "select",
                          "editable": true,
                          "required": false,
                          "visible": true,
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      },
                      {
                          "code": "shuffle",
                          "name": "Shuffle Questions",
                          "label": "Shuffle Questions",
                          "placeholder": "Shuffle Questions",
                          "description": "If shuffle questions is selected, users are presented with questions in a random order whenever they attempt the assessment",
                          "default": "false",
                          "dataType": "boolean",
                          "inputType": "checkbox",
                          "editable": true,
                          "required": false,
                          "visible": true,
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      },
                      {
                          "code": "showFeedback",
                          "name": "Show Feedback",
                          "label": "Show Question Feedback",
                          "placeholder": "Select Option",
                          "description": "If feedback is selected, users are informed whether they have correctly answered question or not",
                          "dataType": "boolean",
                          "inputType": "checkbox",
                          "editable": true,
                          "required": false,
                          "visible": true,
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      },
                      {
                          "code": "showSolutions",
                          "name": "Show Solution",
                          "label": "Show Solution",
                          "placeholder": "Select Option",
                          "description": "If show solution is selected then solutions for each question will be shown to the user",
                          "dataType": "boolean",
                          "inputType": "checkbox",
                          "editable": true,
                          "required": false,
                          "visible": true,
                          "renderingHints": {
                              "class": "sb-g-col-lg-1"
                          }
                      }
                  ]
              }
          }
      }
  }
};

export const SelectedNodeMockData = {
  data: {
    id: 'do_1134346930267422721115',
    primaryCategory: 'Multiselect Multiple Choice Question',
    objectType: 'Question',
    metadata: {
      parent: 'do_11343286128632627218',
      code: '7b3704d2-a85c-5c92-eb59-97adf0ea3c05',
      subject: ['English'],
      showRemarks: 'No',
      channel: '01309282781705830427',
      language: ['English'],
      medium: ['English'],
      mimeType: 'application/vnd.sunbird.question',
      templateId: 'mcq-vertical',
      createdOn: '2021-12-20T05:12:56.116+0000',
      objectType: 'Question',
      gradeLevel: ['Grade 2'],
      primaryCategory: 'Multiselect Multiple Choice Question',
      contentDisposition: 'inline',
      lastUpdatedOn: '2021-12-20T05:12:56.116+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_1134346930267422721115',
      lastStatusChangedOn: '2021-12-20T05:12:56.116+0000',
      visibility: 'Parent',
      showTimer: false,
      author: 'check1@yopmail.com',
      index: 1,
      qType: 'MCQ',
      languageCode: ['en'],
      version: 1,
      versionKey: '1639977176118',
      showFeedback: false,
      license: 'CC BY 4.0',
      interactionTypes: ['choice'],
      framework: 'nit_k-12',
      depth: 2,
      createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
      compatibilityLevel: 4,
      name: 'Question 2',
      topic: ['Forest'],
      board: 'CBSE',
      status: 'Draft',
      showEvidence: 'No',
    },
    root: false,
  },
};

export const BranchingLogicData = {
  do_113432866096922624110: {
    target: ['do_113432866799935488112', 'do_113432921842950144114'],
    preCondition: {},
    source: [],
  },
  do_113432866799935488112: {
    target: [],
    source: ['do_113432866096922624110'],
    preCondition: {
      and: [
        {
          eq: [
            {
              var: 'do_113432866096922624110.response1.value',
              type: 'responseDeclaration',
            },
            [1],
          ],
        },
      ],
    },
  },
  do_113432921842950144114: {
    target: [],
    source: ['do_113432866096922624110'],
    preCondition: {
      and: [
        {
          eq: [
            {
              var: 'do_113432866096922624110.response1.value',
              type: 'responseDeclaration',
            },
            [1],
          ],
        },
      ],
    },
  },
};

export const treeNodeData = {
  data: {
    id: 'do_113432866096922624110',
    primaryCategory: 'Multiselect Multiple Choice Question',
    objectType: 'Question',
    metadata: {
      parent: 'do_11343286128632627218',
      code: '50d43f69-851a-1256-43c4-89412d2966be',
      subject: ['English'],
      showRemarks: 'No',
      channel: '01309282781705830427',
      language: ['English'],
      medium: ['English'],
      mimeType: 'application/vnd.sunbird.question',
      templateId: 'mcq-vertical',
      createdOn: '2021-12-17T15:16:02.222+0000',
      objectType: 'Question',
      gradeLevel: ['Grade 2'],
      primaryCategory: 'Multiselect Multiple Choice Question',
      contentDisposition: 'inline',
      lastUpdatedOn: '2021-12-17T17:09:05.878+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_113432866096922624110',
      lastStatusChangedOn: '2021-12-17T15:16:02.222+0000',
      visibility: 'Parent',
      showTimer: false,
      author: 'check1@yopmail.com',
      index: 2,
      qType: 'MCQ',
      languageCode: ['en'],
      version: 1,
      versionKey: '1639760945887',
      showFeedback: false,
      license: 'CC BY 4.0',
      interactionTypes: ['choice'],
      framework: 'nit_k-12',
      depth: 2,
      createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
      compatibilityLevel: 4,
      name: 'Question 1',
      topic: ['Forest'],
      board: 'CBSE',
      status: 'Draft',
      showEvidence: 'No',
    },
    root: false,
  },
  parent: {
    data: {
      id: 'do_1134460694911631361251',
    },
    id: 'do_1134460694911631361251',
    primaryCategory: 'Observation',
    objectType: 'QuestionSet',
    metadata: {
      parent: 'do_11343286031200256013',
      code: '27c2433b-ecbb-6e8e-4a59-a42b2f5ca2d5',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2022-01-05T06:58:24.683+0000',
      objectType: 'QuestionSet',
      primaryCategory: 'Observation',
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-05T06:58:24.683+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_1134460694911631361251',
      lastStatusChangedOn: '2022-01-05T06:58:24.683+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 4,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1641365904683',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      branchingLogic: {
        do_113432866096922624110: {
          target: ['do_113432866799935488112', 'do_113432921842950144114'],
          preCondition: {},
          source: [],
        },
        do_113432866799935488112: {
          target: [],
          source: ['do_113432866096922624110'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_113432866096922624110.response1.value',
                    type: 'responseDeclaration',
                  },
                  [1],
                ],
              },
            ],
          },
        },
        do_113432921842950144114: {
          target: [],
          source: ['do_113432866096922624110'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_113432866096922624110.response1.value',
                    type: 'responseDeclaration',
                  },
                  [1],
                ],
              },
            ],
          },
        },
      },
      allowMultipleInstances: null,
      instances: null,
    },
    root: false,
  },
};

export const rootNodeData = {
  organisationId: '937dd865-b256-4c1a-9830-a9b5b89f0913',
  keywords: ['One'],
  subject: ['English'],
  channel: '01309282781705830427',
  language: ['English'],
  mimeType: 'application/vnd.sunbird.questionset',
  showHints: false,
  objectType: 'QuestionSet',
  gradeLevel: ['Grade 2'],
  primaryCategory: 'Observation',
  children: [
    {
      parent: 'do_11343286031200256013',
      code: 'b45657f0-5888-6854-c7e8-d60d79a701f3',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      branchingLogic: {
        do_1134468013653114881310: {
          target: [
            'e232be0d-e998-8174-3122-e2c6279dc9f7',
            '7dfa8f6e-7081-548b-5ee6-1b177078ec12',
          ],
          preCondition: {},
          source: [],
        },
        'e232be0d-e998-8174-3122-e2c6279dc9f7': {
          target: [],
          source: ['do_1134468013653114881310'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_1134468013653114881310.response1.value',
                    type: 'responseDeclaration',
                  },
                  [0],
                ],
              },
            ],
          },
        },
        '7dfa8f6e-7081-548b-5ee6-1b177078ec12': {
          target: [],
          source: ['do_1134468013653114881310'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_1134468013653114881310.response1.value',
                    type: 'responseDeclaration',
                  },
                  [1],
                ],
              },
            ],
          },
        },
      },
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2021-12-17T15:06:01.773+0000',
      objectType: 'QuestionSet',
      allowMultipleInstances: 'No',
      primaryCategory: 'Observation',
      children: [
        {
          parent: 'do_11343286117804441614',
          code: '05ef6d3b-7929-6606-6fe7-006e39875497',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          templateId: 'mcq-vertical',
          createdOn: '2022-01-06T07:47:24.789+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Multiselect Multiple Choice Question',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T09:08:35.468+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468013653114881310',
          lastStatusChangedOn: '2022-01-06T07:47:24.789+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 1,
          qType: 'MCQ',
          languageCode: ['en'],
          version: 1,
          versionKey: '1641460115474',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['choice'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'test',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286117804441614',
          code: '7dfa8f6e-7081-548b-5ee6-1b177078ec12',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T09:09:25.126+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Slider',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T09:09:25.125+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468416727121921322',
          lastStatusChangedOn: '2022-01-06T09:09:25.126+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 2,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641460165127',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['slider'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'child slider 2',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286117804441614',
          code: 'e232be0d-e998-8174-3122-e2c6279dc9f7',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T09:01:50.561+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Slider',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T09:01:50.561+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468379489157121320',
          lastStatusChangedOn: '2022-01-06T09:01:50.562+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 3,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641459710566',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['slider'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'child slider',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286117804441614',
          code: '424f066e-c69a-a5c6-f733-d380ff24ae6b',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T07:47:47.570+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Slider',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T08:41:05.349+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468015519334401312',
          lastStatusChangedOn: '2022-01-06T07:47:47.570+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 4,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641458465355',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['slider'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'slider',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286117804441614',
          code: '37631b94-9797-66b1-d8bb-959cf8be6360',
          subject: ['English'],
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T08:43:27.769+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Date',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T08:43:27.769+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468289148436481316',
          lastStatusChangedOn: '2022-01-06T08:43:27.769+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 5,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641458607849',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['date'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Date',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          level: 3,
        },
        {
          parent: 'do_11343286117804441614',
          code: '17b8f38d-d75f-c527-40cc-d5112fa73a02',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T08:44:10.212+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Text',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T08:44:10.212+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468292625367041318',
          lastStatusChangedOn: '2022-01-06T08:44:10.212+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 6,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641458650214',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['text'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Text',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
      ],
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-06T09:09:25.125+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_11343286117804441614',
      lastStatusChangedOn: '2021-12-17T15:06:01.774+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 1,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1639753561773',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section 1',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      level: 2,
    },
    {
      parent: 'do_11343286031200256013',
      code: 'a8cad110-dbb0-509d-054a-e7f5ce2a70b9',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      branchingLogic: {
        do_1134468667041873921324: {
          target: ['b74f8786-cc91-2c77-5313-e7ebe372d4ea'],
          preCondition: {},
          source: [],
        },
        'b74f8786-cc91-2c77-5313-e7ebe372d4ea': {
          target: [],
          source: ['do_1134468667041873921324'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_1134468667041873921324.response1.value',
                    type: 'responseDeclaration',
                  },
                  [0],
                ],
              },
            ],
          },
        },
      },
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2021-12-17T15:06:08.993+0000',
      objectType: 'QuestionSet',
      primaryCategory: 'Observation',
      children: [
        {
          parent: 'do_11343286123719065616',
          code: '911c0d3a-8e33-4e4e-2ebf-dc6cb7b5a8ca',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          templateId: 'mcq-vertical',
          createdOn: '2022-01-06T10:00:20.726+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Multiselect Multiple Choice Question',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T10:00:44.188+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468667041873921324',
          lastStatusChangedOn: '2022-01-06T10:00:20.726+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 1,
          qType: 'MCQ',
          languageCode: ['en'],
          version: 1,
          versionKey: '1641463244196',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['choice'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'MCQ Question',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286123719065616',
          code: 'b74f8786-cc91-2c77-5313-e7ebe372d4ea',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2022-01-06T10:01:45.147+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Slider',
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T10:01:45.147+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134468673957642241326',
          lastStatusChangedOn: '2022-01-06T10:01:45.147+0000',
          creator: 'Vaibahv Bhuva',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 2,
          languageCode: ['en'],
          version: 1,
          versionKey: '1641463305148',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['slider'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'child Slider',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
      ],
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-06T10:01:45.148+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_11343286123719065616',
      lastStatusChangedOn: '2021-12-17T15:06:08.993+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 2,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1639753568993',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section 2',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      level: 2,
    },
    {
      parent: 'do_11343286031200256013',
      code: '7d0efbb3-56a0-5d63-5d9a-54602cc0e489',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      branchingLogic: {
        do_113432866096922624110: {
          target: ['do_113432866799935488112', 'do_113432921842950144114'],
          preCondition: {},
          source: [],
        },
        do_113432866799935488112: {
          target: [],
          source: ['do_113432866096922624110'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_113432866096922624110.response1.value',
                    type: 'responseDeclaration',
                  },
                  [1],
                ],
              },
            ],
          },
        },
        do_113432921842950144114: {
          target: [],
          source: ['do_113432866096922624110'],
          preCondition: {
            and: [
              {
                eq: [
                  {
                    var: 'do_113432866096922624110.response1.value',
                    type: 'responseDeclaration',
                  },
                  [1],
                ],
              },
            ],
          },
        },
      },
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2021-12-17T15:06:14.991+0000',
      objectType: 'QuestionSet',
      primaryCategory: 'Observation',
      children: [
        {
          parent: 'do_11343286128632627218',
          code: '7b3704d2-a85c-5c92-eb59-97adf0ea3c05',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          templateId: 'mcq-vertical',
          createdOn: '2021-12-20T05:12:56.116+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Multiselect Multiple Choice Question',
          contentDisposition: 'inline',
          lastUpdatedOn: '2021-12-20T05:12:56.116+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_1134346930267422721115',
          lastStatusChangedOn: '2021-12-20T05:12:56.116+0000',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 1,
          qType: 'MCQ',
          languageCode: ['en'],
          version: 1,
          versionKey: '1639977176118',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['choice'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Question 2',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286128632627218',
          code: '50d43f69-851a-1256-43c4-89412d2966be',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          templateId: 'mcq-vertical',
          createdOn: '2021-12-17T15:16:02.222+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Multiselect Multiple Choice Question',
          contentDisposition: 'inline',
          lastUpdatedOn: '2021-12-17T17:09:05.878+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_113432866096922624110',
          lastStatusChangedOn: '2021-12-17T15:16:02.222+0000',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 2,
          qType: 'MCQ',
          languageCode: ['en'],
          version: 1,
          versionKey: '1639760945887',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['choice'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Question 1',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286128632627218',
          code: 'cff29d49-4fee-e1db-ec18-38ad51d1d88a',
          subject: ['English'],
          showRemarks: 'No',
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2021-12-17T15:17:28.039+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Slider',
          contentDisposition: 'inline',
          lastUpdatedOn: '2021-12-17T15:17:28.039+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_113432866799935488112',
          lastStatusChangedOn: '2021-12-17T15:17:28.040+0000',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 3,
          languageCode: ['en'],
          version: 1,
          versionKey: '1639754248146',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['slider'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Dep Question 1',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          showEvidence: 'No',
          level: 3,
        },
        {
          parent: 'do_11343286128632627218',
          code: 'a73d1022-b7ee-7ec6-7125-51937a69e5c3',
          subject: ['English'],
          channel: '01309282781705830427',
          language: ['English'],
          medium: ['English'],
          mimeType: 'application/vnd.sunbird.question',
          createdOn: '2021-12-17T17:09:27.157+0000',
          objectType: 'Question',
          gradeLevel: ['Grade 2'],
          primaryCategory: 'Date',
          contentDisposition: 'inline',
          lastUpdatedOn: '2021-12-17T17:09:27.157+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_113432921842950144114',
          lastStatusChangedOn: '2021-12-17T17:09:27.157+0000',
          visibility: 'Parent',
          showTimer: false,
          author: 'check1@yopmail.com',
          index: 4,
          languageCode: ['en'],
          version: 1,
          versionKey: '1639760967159',
          showFeedback: false,
          license: 'CC BY 4.0',
          interactionTypes: ['date'],
          framework: 'nit_k-12',
          depth: 2,
          createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
          compatibilityLevel: 4,
          name: 'Dep Question 2',
          topic: ['Forest'],
          board: 'CBSE',
          status: 'Draft',
          level: 3,
        },
      ],
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-06T07:37:24.226+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_11343286128632627218',
      lastStatusChangedOn: '2021-12-17T15:06:14.991+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 3,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1639753574991',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section 3',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      level: 2,
    },
    {
      parent: 'do_11343286031200256013',
      code: '27c2433b-ecbb-6e8e-4a59-a42b2f5ca2d5',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2022-01-05T06:58:24.683+0000',
      objectType: 'QuestionSet',
      primaryCategory: 'Observation',
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-05T06:58:24.683+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_1134460694911631361251',
      lastStatusChangedOn: '2022-01-05T06:58:24.683+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 4,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1641365904683',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      level: 2,
    },
    {
      parent: 'do_11343286031200256013',
      code: '3806ef40-1363-7845-bd98-8d229c55c672',
      allowScoring: 'No',
      allowSkip: 'Yes',
      containsUserData: 'No',
      channel: '01309282781705830427',
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      createdOn: '2022-01-05T06:58:24.684+0000',
      objectType: 'QuestionSet',
      primaryCategory: 'Observation',
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-01-05T06:58:24.684+0000',
      contentEncoding: 'gzip',
      showSolutions: false,
      allowAnonymousAccess: 'Yes',
      identifier: 'do_1134460694911713281253',
      lastStatusChangedOn: '2022-01-05T06:58:24.684+0000',
      requiresSubmit: 'No',
      visibility: 'Parent',
      showTimer: false,
      index: 5,
      setType: 'materialised',
      languageCode: ['en'],
      version: 1,
      versionKey: '1641365904684',
      showFeedback: false,
      license: 'CC BY 4.0',
      depth: 1,
      compatibilityLevel: 5,
      name: 'Section',
      navigationMode: 'non-linear',
      allowBranching: 'Yes',
      shuffle: true,
      attributions: [],
      status: 'Draft',
      level: 2,
    },
  ],
  contentEncoding: 'gzip',
  showSolutions: false,
  identifier: 'do_11343286031200256013',
  visibility: 'Default',
  showTimer: false,
  author: 'check1@yopmail.com',
  entityType: 'Block',
  consumerId: '028d6fb1-2d6f-4331-86aa-f7cf491a41e0',
  childNodes: [
    'do_1134460694911631361251',
    'do_1134468667041873921324',
    'do_11343286123719065616',
    'do_1134468673957642241326',
    'do_1134468289148436481316',
    'do_11343286117804441614',
    'do_1134468379489157121320',
    'do_1134468292625367041318',
    'do_1134468015519334401312',
    'do_1134468416727121921322',
    'do_1134468013653114881310',
    'do_1134460694911713281253',
    'do_1134346930267422721115',
    'do_11343286128632627218',
    'do_113432866096922624110',
    'do_113432866799935488112',
    'do_113432921842950144114',
  ],
  maxScore: 11,
  languageCode: ['en'],
  version: 1,
  license: 'CC BY 4.0',
  name: 'Observation without rubrics',
  allowBranching: 'No',
  status: 'Draft',
  code: 'a72205fc-acba-d622-0f1a-38e1a465a9d6',
  allowScoring: 'Yes',
  allowSkip: 'Yes',
  containsUserData: 'No',
  description: 'Some description goes here',
  medium: ['English'],
  createdOn: '2021-12-17T15:04:16.056+0000',
  contentDisposition: 'inline',
  lastUpdatedOn: '2022-01-06T10:01:45.194+0000',
  allowAnonymousAccess: 'Yes',
  lastStatusChangedOn: '2021-12-17T15:04:16.056+0000',
  creator: 'check1@yopmail.com',
  requiresSubmit: 'No',
  setType: 'materialised',
  versionKey: '1641463305194',
  showFeedback: false,
  framework: 'nit_k-12',
  depth: 0,
  createdBy: '4e397c42-495e-4fdb-8558-f98176230916',
  compatibilityLevel: 5,
  navigationMode: 'non-linear',
  shuffle: true,
  board: 'CBSE',
  programId: '1a4d0130-1a9b-11ec-8655-6320ba8843b0',
  instructions: '',
  level: 1,
  timeLimits: {
    questionSet: {
      min: 0,
      max: 300
    }
  },
};


export const hierarchyRootNodeData = {
  data: {
    id: 'do_113465817808076800130',
    primaryCategory: 'Observation',
    objectType: 'QuestionSet',
    metadata: {
      organisationId: '937dd865-b256-4c1a-9830-a9b5b89f0913',
      subject: ['English'],
      channel: '01309282781705830427',
      language: ['English'],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      objectType: 'QuestionSet',
      gradeLevel: ['Grade 1'],
      primaryCategory: 'Observation',
      contentEncoding: 'gzip',
      showSolutions: false,
      identifier: 'do_113465817808076800130',
      subjectIds: ['nit_k-12_subject_english'],
      visibility: 'Default',
      showTimer: false,
      author: 'check1@yopmail.com',
      entityType: 'District',
      consumerId: '028d6fb1-2d6f-4331-86aa-f7cf491a41e0',
      childNodes: [
        'do_11346651505003724811',
        'do_113465852674375680131',
        'do_113465863729643520139',
        'do_113465863466934272137',
        'do_113465858696970240133',
        'do_113465862715580416135',
      ],
      children: [
        {
          parent: 'do_11343286031200256013',
          code: 'b45657f0-5888-6854-c7e8-d60d79a701f3',
          allowScoring: 'No',
          allowSkip: 'Yes',
          containsUserData: 'No',
          channel: '01309282781705830427',
          branchingLogic: {
            do_1134468013653114881310: {
              target: [
                'e232be0d-e998-8174-3122-e2c6279dc9f7',
                '7dfa8f6e-7081-548b-5ee6-1b177078ec12',
              ],
              preCondition: {},
              source: [],
            },
            'e232be0d-e998-8174-3122-e2c6279dc9f7': {
              target: [],
              source: ['do_1134468013653114881310'],
              preCondition: {
                and: [
                  {
                    eq: [
                      {
                        var: 'do_1134468013653114881310.response1.value',
                        type: 'responseDeclaration',
                      },
                      [0],
                    ],
                  },
                ],
              },
            },
            '7dfa8f6e-7081-548b-5ee6-1b177078ec12': {
              target: [],
              source: ['do_1134468013653114881310'],
              preCondition: {
                and: [
                  {
                    eq: [
                      {
                        var: 'do_1134468013653114881310.response1.value',
                        type: 'responseDeclaration',
                      },
                      [1],
                    ],
                  },
                ],
              },
            },
          },
          language: ['English'],
          mimeType: 'application/vnd.sunbird.questionset',
          showHints: false,
          createdOn: '2021-12-17T15:06:01.773+0000',
          objectType: 'QuestionSet',
          allowMultipleInstances: 'No',
          primaryCategory: 'Observation',
          children: [
            {
              parent: 'do_11343286117804441614',
              code: '05ef6d3b-7929-6606-6fe7-006e39875497',
              subject: ['English'],
              showRemarks: 'No',
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              templateId: 'mcq-vertical',
              createdOn: '2022-01-06T07:47:24.789+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Multiselect Multiple Choice Question',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T09:08:35.468+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468013653114881310',
              lastStatusChangedOn: '2022-01-06T07:47:24.789+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 1,
              qType: 'MCQ',
              languageCode: ['en'],
              version: 1,
              versionKey: '1641460115474',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['choice'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'test',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              showEvidence: 'No',
              level: 3,
            },
            {
              parent: 'do_11343286117804441614',
              code: '7dfa8f6e-7081-548b-5ee6-1b177078ec12',
              subject: ['English'],
              showRemarks: 'No',
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              createdOn: '2022-01-06T09:09:25.126+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Slider',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T09:09:25.125+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468416727121921322',
              lastStatusChangedOn: '2022-01-06T09:09:25.126+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 2,
              languageCode: ['en'],
              version: 1,
              versionKey: '1641460165127',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['slider'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'child slider 2',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              showEvidence: 'No',
              level: 3,
            },
            {
              parent: 'do_11343286117804441614',
              code: 'e232be0d-e998-8174-3122-e2c6279dc9f7',
              subject: ['English'],
              showRemarks: 'No',
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              createdOn: '2022-01-06T09:01:50.561+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Slider',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T09:01:50.561+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468379489157121320',
              lastStatusChangedOn: '2022-01-06T09:01:50.562+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 3,
              languageCode: ['en'],
              version: 1,
              versionKey: '1641459710566',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['slider'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'child slider',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              showEvidence: 'No',
              level: 3,
            },
            {
              parent: 'do_11343286117804441614',
              code: '424f066e-c69a-a5c6-f733-d380ff24ae6b',
              subject: ['English'],
              showRemarks: 'No',
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              createdOn: '2022-01-06T07:47:47.570+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Slider',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T08:41:05.349+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468015519334401312',
              lastStatusChangedOn: '2022-01-06T07:47:47.570+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 4,
              languageCode: ['en'],
              version: 1,
              versionKey: '1641458465355',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['slider'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'slider',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              showEvidence: 'No',
              level: 3,
            },
            {
              parent: 'do_11343286117804441614',
              code: '37631b94-9797-66b1-d8bb-959cf8be6360',
              subject: ['English'],
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              createdOn: '2022-01-06T08:43:27.769+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Date',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T08:43:27.769+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468289148436481316',
              lastStatusChangedOn: '2022-01-06T08:43:27.769+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 5,
              languageCode: ['en'],
              version: 1,
              versionKey: '1641458607849',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['date'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'Date',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              level: 3,
            },
            {
              parent: 'do_11343286117804441614',
              code: '17b8f38d-d75f-c527-40cc-d5112fa73a02',
              subject: ['English'],
              showRemarks: 'No',
              channel: '01309282781705830427',
              language: ['English'],
              medium: ['English'],
              mimeType: 'application/vnd.sunbird.question',
              createdOn: '2022-01-06T08:44:10.212+0000',
              objectType: 'Question',
              gradeLevel: ['Grade 2'],
              primaryCategory: 'Text',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-01-06T08:44:10.212+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1134468292625367041318',
              lastStatusChangedOn: '2022-01-06T08:44:10.212+0000',
              creator: 'Vaibahv Bhuva',
              visibility: 'Parent',
              showTimer: false,
              author: 'check1@yopmail.com',
              index: 6,
              languageCode: ['en'],
              version: 1,
              versionKey: '1641458650214',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: ['text'],
              framework: 'nit_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'Text',
              topic: ['Forest'],
              board: 'CBSE',
              status: 'Draft',
              showEvidence: 'No',
              level: 3,
            },
          ],
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-01-06T09:09:25.125+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          allowAnonymousAccess: 'Yes',
          identifier: 'do_11343286117804441614',
          lastStatusChangedOn: '2021-12-17T15:06:01.774+0000',
          requiresSubmit: 'No',
          visibility: 'Parent',
          showTimer: false,
          index: 1,
          setType: 'materialised',
          languageCode: ['en'],
          version: 1,
          versionKey: '1639753561773',
          showFeedback: false,
          license: 'CC BY 4.0',
          depth: 1,
          compatibilityLevel: 5,
          name: 'Section 1',
          navigationMode: 'non-linear',
          allowBranching: 'Yes',
          shuffle: true,
          attributions: [],
          status: 'Draft',
          level: 2,
        },
      ],
      maxScore: 4,
      languageCode: ['en'],
      version: 1,
      license: 'CC BY 4.0',
      name: 'Observation Without Rubrics',
      allowBranching: 'Yes',
      mediumIds: ['nit_k-12_medium_english'],
      status: 'Draft',
      code: '2d6e6905-f142-0a51-2765-1dd88e79251e',
      allowScoring: 'Yes',
      allowSkip: 'Yes',
      containsUserData: 'No',
      medium: ['English'],
      createdOn: '2022-02-02T04:36:27.901+0000',
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-02-04T04:07:40.376+0000',
      allowAnonymousAccess: 'Yes',
      lastStatusChangedOn: '2022-02-02T04:36:27.901+0000',
      creator: 'check1@yopmail.com',
      requiresSubmit: 'No',
      setType: 'materialised',
      versionKey: '1643947660376',
      showFeedback: false,
      framework: 'nit_k-12',
      depth: 0,
      boardIds: ['nit_k-12_board_cbse'],
      createdBy: '4e397c42-495e-4fdb-8558-f98176230916',
      compatibilityLevel: 5,
      navigationMode: 'non-linear',
      shuffle: true,
      gradeLevelIds: ['nit_k-12_gradelevel_grade-1'],
      board: 'CBSE',
      programId: '3ef43b40-7dc7-11ec-bb5d-23c7a3b99eb5',
      instructions: '',
      level: 1,
      timeLimits: {
        questionSet: {
          min: 0,
          max: 300
        }
      },
      audience: [],
      description: null,
    },
    root: true,
  },
  folder: true
};

export const observationAndRubericsField = [
  {
    code: 'evidenceMimeType',
    name: 'evidenceMimeType',
    label: 'evidenceMimeType',
    placeholder: 'evidenceMimeType',
    description: 'evidenceMimeType',
    dataType: 'text',
    inputType: 'select',
    range: ['xyz'],
    editable: true,
    required: true,
    visible: true,
    renderingHints: {
      class: 'sb-g-col-lg-1 required'
    }
  },
  {
    code: 'ecm',
    name: 'ecm',
    label: 'ecm',
    placeholder: 'ecm',
    description: 'ecm',
    dataType: 'text',
    inputType: 'select',
    range: ['xyz'],
    editable: true,
    required: true,
    visible: true,
    renderingHints: {
      class: 'sb-g-col-lg-1 required'
    }
  }
];

export const questionsetRead = {
  result: {
    questionset: {
      mimeType: 'application/vnd.sunbird.questionset',
      primaryCategory: 'Practice Question Set',
      identifier: 'do_11352672140540313617',
      languageCode: [
        'en'
      ],
      status: 'Draft',
      contentDisposition: 'inline',
      framework: 'ekstep_ncert_k-12',
      createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64'
    }
  }
};

export const questionsetHierarchyRead = {
  result: {
    questionSet: {
      copyright: 'NIT123',
      subject: [
        'Mathematics'
      ],
      channel: '01309282781705830427',
      language: [
        'English'
      ],
      mimeType: 'application/vnd.sunbird.questionset',
      showHints: false,
      objectType: 'QuestionSet',
      gradeLevel: [
        'Class 6'
      ],
      appIcon: 'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/content/do_113253856016146432127/artifact/do_113253856016146432127_1617902346121_image.jpg',
      primaryCategory: 'Practice Question Set',
      children: [
        {
          parent: 'do_11352672140540313617',
          code: '60a9682f-6cec-0888-4802-22eca465994c',
          allowSkip: 'Yes',
          containsUserData: 'No',
          channel: '01309282781705830427',
          description: 'Section-1',
          language: [
            'English'
          ],
          mimeType: 'application/vnd.sunbird.questionset',
          showHints: false,
          createdOn: '2022-04-29T05:47:15.910+0000',
          objectType: 'QuestionSet',
          scoreCutoffType: 'AssessmentLevel',
          primaryCategory: 'Practice Question Set',
          children: [
            {
              parent: 'do_11352672244457472018',
              copyright: 'NIT123',
              code: 'c477a1e2-0826-e209-0c01-af5aea10a07f',
              subject: [
                'Mathematics'
              ],
              channel: '01309282781705830427',
              language: [
                'English'
              ],
              medium: [
                'English'
              ],
              mimeType: 'application/vnd.sunbird.question',
              templateId: 'mcq-vertical',
              createdOn: '2022-05-02T09:29:16.395+0000',
              objectType: 'Question',
              gradeLevel: [
                'Class 6'
              ],
              primaryCategory: 'Multiple Choice Question',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-05-24T09:01:06.403+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_113528954932387840149',
              lastStatusChangedOn: '2022-05-02T09:29:16.395+0000',
              audience: [
                'Administrator'
              ],
              visibility: 'Parent',
              showTimer: false,
              author: 'N11',
              index: 1,
              qType: 'MCQ',
              maxScore: 3,
              languageCode: [
                'en'
              ],
              version: 1,
              versionKey: '1653382866425',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: [
                'choice'
              ],
              framework: 'ekstep_ncert_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'Subtraction',
              topic: [
                'Forest'
              ],
              board: 'CBSE',
              status: 'Draft'
            },
            {
              parent: 'do_11352672244457472018',
              copyright: 'NIT123',
              code: 'c0a40a20-b486-e4d8-16af-18279fd1fd15',
              subject: [
                'Mathematics'
              ],
              channel: '01309282781705830427',
              language: [
                'English'
              ],
              medium: [
                'English'
              ],
              mimeType: 'application/vnd.sunbird.question',
              templateId: 'mcq-vertical',
              createdOn: '2022-05-19T07:09:39.424+0000',
              objectType: 'Question',
              gradeLevel: [
                'Class 6'
              ],
              primaryCategory: 'Multiple Choice Question',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-05-24T09:01:23.476+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1135409187178414081138',
              lastStatusChangedOn: '2022-05-19T07:09:39.424+0000',
              audience: [
                'Administrator'
              ],
              visibility: 'Parent',
              showTimer: false,
              author: 'N11',
              index: 2,
              qType: 'MCQ',
              maxScore: 1,
              languageCode: [
                'en'
              ],
              version: 1,
              versionKey: '1653382883494',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: [
                'choice'
              ],
              framework: 'ekstep_ncert_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'Addition',
              topic: [
                'Forest'
              ],
              board: 'CBSE',
              status: 'Draft'
            },
            {
              parent: 'do_11352672244457472018',
              copyright: 'NIT123',
              code: 'd2be8a5e-4376-c142-b81b-84d86b50e18b',
              subject: [
                'Mathematics'
              ],
              channel: '01309282781705830427',
              language: [
                'English'
              ],
              medium: [
                'English'
              ],
              mimeType: 'application/vnd.sunbird.question',
              templateId: 'mcq-vertical',
              createdOn: '2022-05-24T09:05:21.548+0000',
              objectType: 'Question',
              gradeLevel: [
                'Class 6'
              ],
              primaryCategory: 'Multiple Choice Question',
              contentDisposition: 'inline',
              lastUpdatedOn: '2022-05-25T12:14:51.598+0000',
              contentEncoding: 'gzip',
              showSolutions: false,
              allowAnonymousAccess: 'Yes',
              identifier: 'do_1135445145317212161146',
              lastStatusChangedOn: '2022-05-24T09:05:21.548+0000',
              audience: [
                'Administrator'
              ],
              visibility: 'Parent',
              showTimer: false,
              author: 'N11',
              index: 3,
              qType: 'MCQ',
              maxScore: 5,
              languageCode: [
                'en'
              ],
              version: 1,
              versionKey: '1653480891617',
              showFeedback: false,
              license: 'CC BY 4.0',
              interactionTypes: [
                'choice'
              ],
              framework: 'ekstep_ncert_k-12',
              depth: 2,
              createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
              compatibilityLevel: 4,
              name: 'Multiplication',
              topic: [
                'Forest'
              ],
              board: 'CBSE',
              status: 'Draft'
            }
          ],
          contentDisposition: 'inline',
          lastUpdatedOn: '2022-05-27T05:09:45.757+0000',
          contentEncoding: 'gzip',
          showSolutions: false,
          trackable: {
            enabled: 'No',
            autoBatch: 'No'
          },
          allowAnonymousAccess: 'Yes',
          identifier: 'do_11352672244457472018',
          lastStatusChangedOn: '2022-04-29T05:47:15.910+0000',
          requiresSubmit: 'No',
          visibility: 'Parent',
          showTimer: false,
          maxQuestions: 3,
          index: 1,
          setType: 'materialised',
          languageCode: [
            'en'
          ],
          version: 1,
          versionKey: '1651211235910',
          showFeedback: false,
          license: 'CC BY 4.0',
          depth: 1,
          compatibilityLevel: 5,
          name: 'Section-1',
          navigationMode: 'non-linear',
          allowBranching: 'No',
          shuffle: false,
          attributions: [],
          status: 'Draft'
        }
      ],
      contentEncoding: 'gzip',
      lockKey: '86c9bcba-12bc-4164-a559-a036d3deca6e',
      showSolutions: false,
      trackable: {
        enabled: 'No',
        autoBatch: 'No'
      },
      identifier: 'do_11352672140540313617',
      audience: [
        'Administrator'
      ],
      visibility: 'Default',
      showTimer: true,
      author: 'N11',
      consumerId: 'bfe5883f-ac66-4744-a064-3ed88d986eba',
      childNodes: [
        'do_113528954932387840149',
        'do_11352672244457472018',
        'do_1135409187178414081138',
        'do_1135445145317212161146'
      ],
      maxScore: 9,
      languageCode: [
        'en'
      ],
      version: 1,
      license: 'CC BY 4.0',
      name: 'Questionset test 2022',
      allowBranching: 'No',
      status: 'Draft',
      code: '23bd70ca-c8aa-c643-524a-8360dc713a94',
      allowSkip: 'Yes',
      containsUserData: 'No',
      description: 'Test Questionset',
      medium: [
        'English'
      ],
      createdOn: '2022-04-29T05:45:09.074+0000',
      scoreCutoffType: 'AssessmentLevel',
      contentDisposition: 'inline',
      lastUpdatedOn: '2022-06-01T12:52:56.950+0000',
      allowAnonymousAccess: 'Yes',
      lastStatusChangedOn: '2022-04-29T05:45:09.074+0000',
      createdFor: [
        '01309282781705830427'
      ],
      requiresSubmit: 'No',
      summaryType: 'Complete',
      setType: 'materialised',
      versionKey: '1654087976950',
      showFeedback: false,
      framework: 'ekstep_ncert_k-12',
      depth: 0,
      createdBy: '5a587cc1-e018-4859-a0a8-e842650b9d64',
      compatibilityLevel: 5,
      navigationMode: 'non-linear',
      timeLimits: {
        questionSet: {
          min: 0,
          max: 300
        }
      },
      shuffle: true,
      board: 'CBSE'
    }
  }
};

export const nodesModifiedData = {
  do_1135515248334110721193: {
      root: false,
      objectType: 'QuestionSet',
      metadata: {
          name: 'Section',
          description: 'Section',
          maxQuestions: 2,
          showSolutions: true,
          showFeedback: true,
          shuffle: false,
          primaryCategory: 'Practice Question Set',
          attributions: []
      },
      isNew: false
  },
  do_1135515246211481601192: {
      root: true,
      objectType: 'QuestionSet',
      metadata: {
          appIcon: '',
          name: 'questionset',
          description: 'questionset',
          instructions: '<p>quuestionset</p>',
          primaryCategory: 'Practice Question Set',
          additionalCategories: [],
          board: 'CBSE',
          medium: [
              'Hindi'
          ],
          gradeLevel: [
              'Class 1'
          ],
          subject: [
              'Mathematics'
          ],
          audience: [
              'Audience1'
          ],
          shuffle: true,
          showFeedback: false,
          showSolutions: false,
          showTimer: true,
          requiresSubmit: 'No',
          summaryType: 'Complete',
          author: 'N118',
          license: 'CC BY 4.0',
          attributions: [],
          timeLimits: {
            questionSet: {
              min: 0,
              max: 300
            }
          },
          keywords: [
              'questionset'
          ],
          maxScore: 2
      },
      isNew: false
  }
};

export const questionSetEditorConfig = {
  context: {
      identifier: 'do_1135459852959088641149',
      channel: '01309282781705830427',
      authToken: '',
      sid: 'jkgkxR7PMNpx3OMu1yt50xh4FuVCKEeY',
      did: '8a7211b150c32dd0453e58fddbcee5ef',
      uid: 'b6640bfe-e294-4a54-8c75-589472324624',
      additionalCategories: [
          'Textbook',
          'Lesson Plan',
          'Curiosity Question Set',
          'Experiential Resource',
          'Explanation Video',
          'Focus Spot',
          'Learning Outcome Definition',
          'Lesson Plan',
          'Marking Scheme Rubric',
          'Pedagogy Flow',
          'Previous Board Exam Papers',
          'TV Lesson',
          'Textbook'
      ],
      host: 'https://dev.sunbirded.org',
      pdata: {
          id: 'dev.sunbird.portal',
          ver: '4.9.1',
          pid: 'sunbird-portal'
      },
      actor: {
          id: 'b6640bfe-e294-4a54-8c75-589472324624',
          type: 'User'
      },
      contextRollup: {
          l1: '01309282781705830427'
      },
      tags: [
          '01309282781705830427',
          '01309282781705830427'
      ],
      timeDiff: -0.928,
      endpoint: '/data/v3/telemetry',
      env: 'questionset_editor',
      user: {
          id: 'b6640bfe-e294-4a54-8c75-589472324624',
          orgIds: [
              '01309282781705830427'
          ],
          organisations: {
              '01309282781705830427': 'NIT'
          },
          fullName: 'N118',
          firstName: 'N118',
          lastName: '',
          isRootOrgAdmin: false
      },
      channelData: {
          code: '01309282781705830427',
          frameworks: [
              {
                  name: 'Centre',
                  relation: 'hasSequenceMember',
                  identifier: 'ekstep_ncert_k-12',
                  description: 'Centre',
                  objectType: 'Framework',
                  status: 'Live',
                  type: 'K-12'
              },
              {
                  name: 'nit_tpd',
                  relation: 'hasSequenceMember',
                  identifier: 'nit_tpd',
                  description: 'nit_tpd Framework',
                  objectType: 'Framework',
                  status: 'Live',
                  type: 'TPD'
              }
          ],
          channel: 'in.ekstep',
          description: 'Preprod Kayal Org',
          createdOn: '2020-08-24T05:00:51.381+0000',
          objectType: 'Channel',
          collectionPrimaryCategories: [
              'Content Playlist',
              'Course',
              'Digital Textbook',
              'Question paper'
          ],
          appId: '@ignore@',
          primaryCategories: [
              {
                  identifier: 'obj-cat:asset_asset_all',
                  name: 'Asset',
                  targetObjectType: 'Asset'
              },
              {
                  identifier: 'obj-cat:content-playlist_collection_all',
                  name: 'Content Playlist',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:content-playlist_content_all',
                  name: 'Content Playlist',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:course-assessment_collection_all',
                  name: 'Course Assessment',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:course-assessment_content_all',
                  name: 'Course Assessment',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:curriculum-course_collection_all',
                  name: 'Curriculum Course',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:demo-practice-question-set_questionset_all',
                  name: 'Demo Practice Question Set',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:digital-textbook_collection_all',
                  name: 'Digital Textbook',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:digitalcourse_collection_all',
                  name: 'DigitalCourse',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:digitalcourse1_collection_all',
                  name: 'DigitalCourse1',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:digitalcourse2_collection_all',
                  name: 'DigitalCourse2',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:etextbook_content_all',
                  name: 'eTextbook',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:explanation-content_content_all',
                  name: 'Explanation Content',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:ftb-question_question_all',
                  name: 'FTB Question',
                  targetObjectType: 'Question'
              },
              {
                  identifier: 'obj-cat:learning-resource_content_all',
                  name: 'Learning Resource',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:learningpath1_collection_all',
                  name: 'LearningPath1',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:multiple-choice-question_question_all',
                  name: 'Multiple Choice Question',
                  targetObjectType: 'Question'
              },
              {
                  identifier: 'obj-cat:observation_questionset_all',
                  name: 'Observation',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:practice-question-set_question_all',
                  name: 'Practice Question Set',
                  targetObjectType: 'Question'
              },
              {
                  identifier: 'obj-cat:practice-question-set_content_all',
                  name: 'Practice Question Set',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:professional-development-course_collection_all',
                  name: 'Professional Development Course',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:subjective-question_question_all',
                  name: 'Subjective Question',
                  targetObjectType: 'Question'
              },
              {
                  identifier: 'obj-cat:survey_questionset_all',
                  name: 'Survey',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:teacher-resource_content_all',
                  name: 'Teacher Resource',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:text-asset_asset_all',
                  name: 'Text Asset',
                  targetObjectType: 'Asset'
              },
              {
                  identifier: 'obj-cat:video-transcript_asset_all',
                  name: 'Video transcript',
                  targetObjectType: 'Asset'
              },
              {
                  identifier: 'obj-cat:course_collection_01309282781705830427',
                  name: 'Course',
                  targetObjectType: 'Collection'
              },
              {
                  identifier: 'obj-cat:ekstep-new-qs_questionset_01309282781705830427',
                  name: 'Ekstep New QS',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:exam-question_content_01309282781705830427',
                  name: 'Exam Question',
                  targetObjectType: 'Content'
              },
              {
                  identifier: 'obj-cat:exam-question-set_questionset_01309282781705830427',
                  name: 'Exam Question Set',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:haryana-new-qs_questionset_01309282781705830427',
                  name: 'Haryana_New_QS',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:observation-with-rubrics_questionset_01309282781705830427',
                  name: 'Observation With Rubrics',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:practice-set_questionset_01309282781705830427',
                  name: 'Practice Set',
                  targetObjectType: 'QuestionSet'
              },
              {
                  identifier: 'obj-cat:question-paper_collection_01309282781705830427',
                  name: 'Question Paper',
                  targetObjectType: 'Collection'
              }
          ],
          additionalCategories: [
              'DigitalCourse',
              'DigitalCourse1',
              'DigitalCourse2',
              'Ekstep New QS',
              'Exam Question Set',
              'Haryana New QS',
              'haryana Question Set',
              'haryana_New_Question Set',
              'LearningPath1',
              'Observation',
              'Practice Set',
              'Survey',
              'Text Asset',
              'Video transcript'
          ],
          lastUpdatedOn: '2022-03-31T10:00:58.199+0000',
          collectionAdditionalCategories: [
              'Textbook',
              'Lesson Plan'
          ],
          contentAdditionalCategories: [
              'Textbook',
              'Lesson Plan',
              'Curiosity Question Set',
              'Experiential Resource',
              'Explanation Video',
              'Focus Spot',
              'Learning Outcome Definition',
              'Lesson Plan',
              'Marking Scheme Rubric',
              'Pedagogy Flow',
              'Previous Board Exam Papers',
              'TV Lesson',
              'Textbook'
          ],
          apoc_num: 1,
          identifier: '01309282781705830427',
          lastStatusChangedOn: '2020-08-24T05:00:51.381+0000',
          consumerId: '7411b6bd-89f3-40ec-98d1-229dc64ce77d',
          assetAdditionalCategories: [],
          languageCode: [],
          versionKey: '1648720858199',
          contentPrimaryCategories: [
              'Course Assessment',
              'eTextbook',
              'Explanation Content',
              'Learning Resource',
              'Practice Question Set',
              'Teacher Resource',
              'Exam Question'
          ],
          name: 'NIT123',
          defaultCourseFramework: 'TPD',
          assetPrimaryCategories: [
              'Asset',
              'CertAsset',
              'Certificate Template'
          ],
          status: 'Live',
          defaultFramework: 'ekstep_ncert_k-12'
      },
      cloudStorageUrls: [
          'https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/',
          'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
          'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/'
      ],
      framework: 'ekstep_ncert_k-12'
  },
  config: {
      mode: 'edit',
      questionSet: {
          maxQuestionsLimit: 500
      },
      maxDepth: 1,
      addFromLibraryEnabled: true,
      enableAddFromLibrary: true,
      objectType: 'QuestionSet',
      primaryCategory: 'Practice Question Set',
      isRoot: true,
      iconClass: 'fa fa-book',
      children: {},
      hierarchy: {
          level1: {
              name: 'Section',
              type: 'Unit',
              mimeType: 'application/vnd.sunbird.questionset',
              primaryCategory: 'Practice Question Set',
              iconClass: 'fa fa-folder-o',
              children: {
                  Question: [
                      'Multiple Choice Question',
                      'Subjective Question'
                  ]
              }
          }
      }
  }
};

export const frameworkData = {
  tpd: {
    identifier: 'tpd',
    code: 'tpd',
    name: 'TPD',
    description: 'TPD Framework',
    categories: [
      {
        identifier: 'tpd_topic',
        code: 'topic',
        terms: [
          {
            identifier: 'tpd_topic_science',
            code: 'science',
            children: [
              {
                identifier: 'tpd_topic_chemistry',
                code: 'chemistry',
                translations: null,
                name: 'Chemistry',
                description: 'Chemistry',
                index: 2,
                category: 'topic',
                status: 'Live',
              },
              {
                identifier: 'tpd_topic_biology',
                code: 'biology',
                translations: null,
                name: 'Biology',
                description: 'Biology',
                index: 3,
                category: 'topic',
                status: 'Live',
              },
              {
                identifier: 'tpd_topic_general_science',
                code: 'general_science',
                translations: null,
                name: 'General Science',
                description: 'General Science',
                index: 4,
                category: 'topic',
                status: 'Live',
              },
            ],
            translations: null,
            name: 'Science',
            description: 'Science',
            index: 1,
            category: 'topic',
            status: 'Live',
          },
        ],
        translations: '{\"hi\":\"विषय\"}',
        name: 'Topics',
        description: 'Topics',
        index: 2,
        status: 'Live',
      },
    ],
    type: "TPD",
    objectType: "Framework",
  },
};

export const serverResponse = {
  id: '',
    params: {
      resmsgid: '',
      msgid: '',
      err: '',
      status: '',
      errmsg: ''
    },
    responseCode: 'OK',
    result: {
    },
    ts: '',
    ver: '',
    headers: {}
};

export  const categoryDefinitionPublishCheckList = {
  "result": {
      "objectCategoryDefinition": {
          "name": "Practice Question Set",
          "forms": {
              "publishchecklist": {
                  "templateName": "",
                  "required": [],
                  "properties": [{
                    name: 'publish check lists',
                    fields: [{
                        "code": "Quality Check",
                        "name": "Quality Check",
                        "label": "Quality Check",
                        "default": "false",
                        "dataType": "boolean",
                        "inputType": "checkbox"
                    }]
                  }]
              }
          }
      }
  }
};
