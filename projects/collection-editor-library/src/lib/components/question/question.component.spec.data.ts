export const mockData = {
  childMetadata: {
    templateName: "",
    required: [],
    properties: [
      {
        code: "name",
        dataType: "text",
        description: "Name of the content",
        editable: true,
        inputType: "text",
        label: "Title",
        name: "Title",
        placeholder: "Title",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        required: true,
        visible: true,
        validations: [
          {
            type: "max",
            value: "120",
            message: "Input is Exceeded",
          },
          {
            type: "required",
            message: "Title is required",
          },
        ],
      },
      {
        code: "description",
        dataType: "text",
        description: "Description of the content",
        editable: true,
        inputType: "textarea",
        label: "Description",
        name: "Description",
        placeholder: "Description",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        required: true,
        visible: true,
        validations: [
          {
            type: "max",
            value: "200",
            message: "Input is Exceeded",
          },
          {
            type: "required",
            message: "Title is required",
          },
        ],
      },
      {
        code: "keywords",
        visible: true,
        editable: true,
        dataType: "list",
        name: "Keywords",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        description: "Keywords for the content",
        inputType: "keywords",
        label: "keywords",
        placeholder: "Enter Keywords",
        required: false,
        validations: [
          {
            type: "required",
            message: "Keyword is required",
          },
        ],
      },
    ],
  },
  mcqQuestionMetaData: {
    id: "api.question.read",
    ver: "3.0",
    ts: "2022-01-31T04:38:30ZZ",
    params: {
      resmsgid: "327f9629-17b6-4b11-b15a-c60279285292",
      msgid: null,
      err: null,
      status: "successful",
      errmsg: null,
    },
    responseCode: "OK",
    result: {
      question: {
        mimeType: "application/vnd.sunbird.question",
        media: [
          {
            src: "/assets/public/content/do_1135205326975467521585/artifact/1650455654269.thumb.png",
            type: "image",
            id: "video_do_1135205326975467521585",
            baseUrl: "https://dock.sunbirded.org",
          },
          {
            id: "do_1135205326975467521585",
            src: "/assets/public/content/assets/do_1135205326975467521585/file_example_mp4_640_3mg.mp4",
            type: "video",
            assetId: "do_1135205326975467521585",
            name: "file_example_MP4_640_3MG",
            thumbnail:
              "/assets/public/content/do_1135205326975467521585/artifact/1650455654269.thumb.png",
            baseUrl: "https://dock.sunbirded.org",
          },
        ],
        editorState: {
          options: [
            {
              answer: false,
              value: {
                body: "<p>option 1</p>",
                value: 0,
              },
            },
            {
              answer: false,
              value: {
                body: "<p>option 2</p>",
                value: 1,
              },
            },
            {
              answer: false,
              value: {
                body: "<p>option 3</p>",
                value: 2,
              },
            },
          ],
          question: "<p>MCQ Question</p>",
        },
        templateId: "mcq-vertical",
        solutions: [
          {
            id: "1",
            type: "video",
          },
        ],
        interactions: {
          response1: {
            type: "choice",
            options: [
              {
                label: "<p>option 1</p>",
                value: 0,
                hints: {
                  en: "test hint 1",
                },
              },
              {
                label: "<p>option 2</p>",
                value: 1,
                hints: {
                  en: "test hint 2",
                },
              },
              {
                label: "<p>option 3</p>",
                value: 2,
                hints: {
                  en: "test hint 3",
                },
              },
            ],
            autoCapture: "Yes",
            validation: {
              limit:{
                maxLength:100
              },
              required: "Yes",
              pattern: "dd/mm/yyyy",
            },
          },
        },
        evidence: {
          mimeType: ["audio", "vedio"],
        },
        name: "MCQ Question",
        responseDeclaration: {
          response1: {
            maxScore: 1,
            cardinality: "multiple",
            type: "integer",
            correctResponse: {
              outcomes: {
                SCORE: 1,
              },
            },
            mapping: [],
          },
        },
        remarks: {
          maxLength: 100,
        },
        interactionTypes: ["choice"],
        qType: "MCQ",
        primaryCategory: "Multiselect Multiple Choice Question",
        body: "<div class='question-body' tabindex='-1'><div class='mcq-title' tabindex='0'><p>MCQ Question</p></div><div data-choice-interaction='response1' class='mcq-vertical'></div></div>",
        creator: "Vaibahv Bhuva",
        createdBy: "5a587cc1-e018-4859-a0a8-e842650b9d64",
        board: "CBSE",
        medium: ["English"],
        gradeLevel: ["Grade 1"],
        subject: ["English"],
        topic: ["Forest"],
        author: "check1@yopmail.com",
        channel: "01309282781705830427",
        framework: "nit_k-12",
        license: "CC BY 4.0",
        maxScore: "1",
        identifier: "",
      },
    },
  },
  sliderQuestionMetaData: {
    id: "api.question.read",
    ver: "3.0",
    ts: "2022-01-31T04:17:19ZZ",
    params: {
      resmsgid: "68a6ed45-a6eb-4fe3-930b-bbcefa7a4511",
      msgid: null,
      err: null,
      status: "successful",
      errmsg: null,
    },
    responseCode: "OK",
    result: {
      question: {
        mimeType: "application/vnd.sunbird.question",
        media: [],
        editorState: {
            answer: '<p>adasd</p>',
            editorState: { answer: '<p>adasd</p>' },
            name: 'Subjective Question',
            primaryCategory: 'Subjective Question',
            qType: 'SA',
            question: '<p>asd</p>',
        },
        body: "<p>Slider Question</p>",
        responseDeclaration: {
          response1: {
            mapping: [],
            type: "integer",
            maxScore: 1,
          },
        },
        solutions: [],
        creator: "Vaibahv Bhuva",
        createdBy: "5a587cc1-e018-4859-a0a8-e842650b9d64",
        board: "CBSE",
        medium: ["English"],
        gradeLevel: ["Grade 1"],
        subject: ["English"],
        topic: ["Forest"],
        author: "check1@yopmail.com",
        channel: "01309282781705830427",
        framework: "nit_k-12",
        license: "CC BY 4.0",
        name: "Slider Question",
        showEvidence: "Yes",
        evidence: {
          required: "No",
          mimeType: ["audio"],
          minCount: 1,
          maxCount: 1,
          sizeLimit: "20480",
        },
        showRemarks: "Yes",
        remarks: {
          maxLength: "100",
          required: "No",
        },
        interactions: {
          validation: {
            required: "Yes",
          },
          response1: {
            validation: {
              range: {
                min: "0",
                max: "10",
              },
            },
            step: "1",
          },
        },
        hints: {
          en: [null],
        },
        instructions: {
          en: [null],
        },
        interactionTypes: ["slider"],
        primaryCategory: "Slider",
      },
    },
  },
  dateQuestionMetaDate: {
    id: "api.question.read",
    ver: "3.0",
    ts: "2022-01-31T04:21:32ZZ",
    params: {
      resmsgid: "10091336-fd86-49bd-8505-2d67e3ce9241",
      msgid: null,
      err: null,
      status: "successful",
      errmsg: null,
    },
    responseCode: "OK",
    result: {
      question: {
        mimeType: "application/vnd.sunbird.question",
        media: [],
        editorState: {
          question: "<p>Child Date Question</p>",
        },
        body: "<p>Child Date Question</p>",
        responseDeclaration: {
          response1: {
            type: "string",
          },
        },
        solutions: [],
        creator: "Vaibahv Bhuva",
        createdBy: "5a587cc1-e018-4859-a0a8-e842650b9d64",
        board: "CBSE",
        medium: ["English"],
        gradeLevel: ["Grade 1"],
        subject: ["English"],
        topic: ["Forest"],
        author: "check1@yopmail.com",
        channel: "01309282781705830427",
        framework: "nit_k-12",
        license: "CC BY 4.0",
        name: "Child Date Question",
        interactions: {
          validation: {
            required: "Yes",
          },
          response1: {
            validation: {
              pattern: "DD/MM/YYYY",
            },
            autoCapture: "Yes",
          },
        },
        hints: {
          en: [null],
        },
        instructions: {
          en: [null],
        },
        interactionTypes: ["date"],
        primaryCategory: "Date",
      },
    },
  },
  textQuestionNetaData: {
    id: "api.question.read",
    ver: "3.0",
    ts: "2022-01-31T04:22:24ZZ",
    params: {
      resmsgid: "a536133f-822e-4533-a57c-5558ef65297d",
      msgid: null,
      err: null,
      status: "successful",
      errmsg: null,
    },
    responseCode: "OK",
    result: {
      question: {
        mimeType: "application/vnd.sunbird.question",
        media: [],
        editorState: {
          question: "<p>Text Question</p>",
        },
        body: "<p>Text Question</p>",
        responseDeclaration: {
          response1: {
            mapping: [],
            type: "string",
            maxScore: 1,
          },
        },
        solutions: [],
        creator: "Vaibahv Bhuva",
        createdBy: "5a587cc1-e018-4859-a0a8-e842650b9d64",
        board: "CBSE",
        medium: ["English"],
        gradeLevel: ["Grade 1"],
        subject: ["English"],
        topic: ["Forest"],
        author: "check1@yopmail.com",
        channel: "01309282781705830427",
        framework: "nit_k-12",
        license: "CC BY 4.0",
        name: "Text Question",
        showEvidence: "No",
        showRemarks: "No",
        interactions: {
          validation: {
            required: "Yes",
          },
          response1: {
            validation: {
              limit: {
                maxLength: "100",
              },
            },
            type: {
              number: "Yes",
            },
          },
        },
        hints: {
          en: [null],
        },
        instructions: {
          en: [null],
        },
        interactionTypes: ["text"],
        primaryCategory: "Text",
      },
    },
  },
  defaultQuestionMetaData: {
    id: "api.question.read",
    ver: "3.0",
    ts: "2022-01-31T04:22:24ZZ",
    params: {
      resmsgid: "a536133f-822e-4533-a57c-5558ef65297d",
      msgid: null,
      err: null,
      status: "successful",
      errmsg: null,
    },
    responseCode: "OK",
    result: {
      question: {
        instructions: {
          en: [null],
        },
        responseDeclaration: {
          response1: {
            type: "string",
            maxScore: 1,
          },
        },
        mimeType: "application/vnd.sunbird.question",
        media: [],
        body: "<p>child Text Question</p>",
        editorState: {
          question: "<p>child Text Question</p>",
        },
        interactions: {
          validation: {
            required: "Yes",
          },
          response1: {},
        },
        primaryCategory: "Default",
        showRemarks: "Yes",
        remarksLimit: "20",
        identifier: "do_11345671149997260811",
        solutions: [],
        hints: {
          en: [null],
        },
        languageCode: ["en"],
        interactionTypes: "",
        name: "child Text Question",
      },
    },
  },
  childMetadataUpdated: {
    templateName: "",
    required: [],
    properties: [
      {
        code: "name",
        dataType: "text",
        description: "Name of the content",
        editable: false,
        inputType: "text",
        label: "Title",
        name: "Title",
        placeholder: "Title",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        required: true,
        visible: true,
        validations: [
          {
            type: "max",
            value: "120",
            message: "Input is Exceeded",
          },
          {
            type: "required",
            message: "Title is required",
          },
        ],
      },
      {
        code: "description",
        dataType: "text",
        description: "Description of the content",
        editable: false,
        inputType: "textarea",
        label: "Description",
        name: "Description",
        placeholder: "Description",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        required: true,
        visible: true,
        validations: [
          {
            type: "max",
            value: "200",
            message: "Input is Exceeded",
          },
          {
            type: "required",
            message: "Title is required",
          },
        ],
      },
      {
        code: "board",
        default: "",
        visible: true,
        depends: [],
        editable: true,
        dataType: "text",
        renderingHints: {
          class: "sb-g-col-lg-1",
        },
        description: "Board",
        label: "Board/Syllabus",
        required: false,
        name: "Board/Syllabus",
        inputType: "select",
        placeholder: "Select Board/Syllabus",
      },
      {
        code: "keywords",
        visible: true,
        editable: false,
        dataType: "list",
        name: "Keywords",
        renderingHints: {
          class: "sb-g-col-lg-1 required",
        },
        description: "Keywords for the content",
        inputType: "keywords",
        label: "keywords",
        placeholder: "Enter Keywords",
        required: false,
        validations: [
          {
            type: "required",
            message: "Keyword is required",
          },
        ],
      },
    ],
  },
  formData: {
    numberOnly: "yes",
    name: "description",
  },
  frameWorkDetails: {
    frameworkData: [
      {
        identifier: "ekstep_ncert_k-12_board",
        code: "board",
        terms: [
          {
            associations: [
              {
                identifier:
                  "ekstep_ncert_k-12_learningoutcome_9686a2a712bdfdb43408555865cda57f2367699a",
                code: "9686a2a712bdfdb43408555865cda57f2367699a",
                translations: null,
                name: "Inequalities in a triangle.",
                description: "Inequalities in a triangle.",
                index: 0,
                category: "learningoutcome",
                status: "Live",
              },
              {
                identifier:
                  "ekstep_ncert_k-12_topic_08859db5d07d93b99c12b3e5bceb975c582d31b7",
                code: "08859db5d07d93b99c12b3e5bceb975c582d31b7",
                translations: null,
                name: "Nature around the kids",
                description: "Nature around the kids",
                index: 0,
                category: "topic",
                status: "Live",
              },
            ],
            identifier: "ekstep_ncert_k-12_board_cbse",
            code: "cbse",
            translations: null,
            name: "CBSE",
            description: "CBSE",
            index: 10,
            category: "board",
            status: "Live",
          },
        ],
        translations: null,
        name: "Board",
        description: "Board",
        index: 1,
        status: "Live",
      },
    ],
    topicList: [
      {
        identifier:
          "ekstep_ncert_k-12_topic_08859db5d07d93b99c12b3e5bceb975c582d31b7",
        code: "08859db5d07d93b99c12b3e5bceb975c582d31b7",
        translations: null,
        name: "Nature around the kids",
        description: "Nature around the kids",
        index: 10,
        category: "topic",
        status: "Live",
      },
    ],
  },
  editorState: {
    body: {
      answer: "</p> Yes</p>",
      question: "<p>Hi how are you ?</p>",
      editorState: {
        answer: "</p> Yes</p>",
      },
      name: "Subjective Question",
      qType: "SA",
      primaryCategory: "Subjective Question",
      responseDeclaration: {
        response1: {
          mapping: [],
        },
      },
    },
    mediaobj: {},
  },
  eventData: {
    body: { answer: "<p>dad</p>" },
    editorState: { answer: "<p>dad</p>" },
    name: "Subjective Question",
    qType: "SA",
    primaryCategory: "Subjective Question",
    mediaobj: undefined,
  },
  subMenus: [
    {
      id: "addHint",
      name: "Add Hint",
      value: "",
      enabled: false,
      type: "input",
      label: "label",
      show: true,
    },
    {
      id: "addTip",
      name: "Add Tip",
      value: "",
      enabled: false,
      type: "input",
      label: "label",
      show: true,
    },
    {
      id: "addDependantQuestion",
      name: "Add Dependant Question",
      value: [{ id: 1 }],
      enabled: false,
      type: "",
      label: "label",
      show: true,
    },
  ],
};

export const readQuestionMock = {
    "responseCode": "OK",
    "result": {
        "question": {
            "media": [],
            "editorState": {
                "answer": "<p>This is anwser</p>",
                "question": "<figure class=\"table\"><table><tbody><tr><td>adssa</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>dasd</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td><td>dsadas</td></tr></tbody></table></figure><ul><li>dasdasdasd</li></ul>",
                "solutions": [
                    {
                        "id": "07c3e152-374c-5430-ddb0-e4001c84c573",
                        "type": "html",
                        "value": "<p>Solution for the subjectiove question</p>"
                    }
                ]
            },
            "primaryCategory": "Subjective Question",
            "identifier": "do_11330103476396851218",
            "solutions": [
                {
                    "id": "07c3e152-374c-5430-ddb0-e4001c84c573",
                    "type": "html",
                    "value": "<p>Solution for the subjectiove question</p>"
                }
            ],
            "qType": "SA",
            "answer": "<p>This is anwser</p>",
            "name": "Subjective Question ",
        }
    }
};

export const collectionHierarchyMock = {
    "responseCode": "OK",
    "result": {
        "questionSet": {
            "copyright": "NIT123",
            "primaryCategory": "Practice Question Set",
            "children": [
                {
                    "parent": "do_11330102570702438417",
                    "copyright": "NIT123",
                    "code": "0b145869-f65e-0303-0994-c4b82560bdb6",
                    "prevStatus": "Review",
                    "objectType": "Question",
                    "primaryCategory": "Subjective Question",
                    "identifier": "do_11330103476396851218",
                }
            ]
        }
    }
};

export const sourcingSettingsMock = {
  enforceCorrectAnswer: false,
  showSolution: false,
  showAddHints: true,
  showAddScore: false,
  showAddTips: true,
  showAddTranslation: true,
  showAddSecondaryQuestion: false,
};

export const leafFormConfigMock = [
  {
    code: "name",
    dataType: "text",
    description: "Name of the content",
    editable: true,
    inputType: "text",
    label: "Title",
    name: "Title",
    placeholder: "Title",
    renderingHints: {
      class: "sb-g-col-lg-1 required",
    },
    required: true,
    visible: true,
    validations: [
      {
        type: "max",
        value: "100",
        message: "Input is Exceeded",
      },
      {
        type: "required",
        message: "Title is required",
      },
    ],
    default: "test",
  },
  {
    code: "allowMultiSelect",
    dataType: "text",
    description: "allowMultiSelect",
    editable: true,
    index: 5,
    default: "Yes",
    inputType: "checkbox",
    label: "Allow Multi Select",
    name: "allowMultiSelect",
    placeholder: "allowMultiSelect",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
  },
  {
    code: "showEvidence",
    dataType: "text",
    description: "Allow Evidence",
    editable: true,
    index: 5,
    default: "Yes",
    inputType: "checkbox",
    label: "Allow Evidence",
    name: "showEvidence",
    placeholder: "showEvidence",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
  },
  {
    code: "evidenceMimeType",
    dataType: "list",
    depends: ["showEvidence"],
    description: "Evidence",
    editable: true,
    inputType: "multiselect",
    label: "evidence",
    name: "evidenceMimeType",
    placeholder: "evidence",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
    range: null,
  },
  {
    code: "showRemarks",
    dataType: "text",
    description: "Allow Remarks",
    editable: false,
    index: 5,
    inputType: "checkbox",
    label: "Allow Remarks",
    name: "showRemarks",
    placeholder: "showRemarks",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
  },
  {
    code: "remarksLimit",
    dataType: "text",
    description: "Remark limit",
    depends: ["showRemarks"],
    editable: false,
    inputType: "text",
    label: "Remark limit",
    name: "remarksLimit",
    placeholder: "Add limit",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
  },
  {
    code: "markAsNotMandatory",
    dataType: "text",
    description: "markAsNotMandatory",
    editable: true,
    index: 5,
    inputType: "checkbox",
    label: "Mark As Not Mandatory",
    name: "markAsNotMandatory",
    placeholder: "markAsNotMandatory",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    required: false,
    visible: true,
    default: "No",
  },
  {
    code: "maxScore",
    dataType: "text",
    description: "Marks",
    editable: true,
    inputType: "text",
    default: "",
    label: "Marks:",
    name: "Marks",
    placeholder: "Marks",
    tooltip: "Provide marks of this question.",
    renderingHints: {
      class: "sb-g-col-lg-1 required",
    },
    validations: [
      {
        type: "pattern",
        value: "^([1-9][0-9]+|[1-9])$",
        message: "Input should be numeric",
      },
      {
        type: "required",
        message: "Marks is required",
      },
    ],
  },
  {
    code: "dateFormat",
    dataType: "text",
    description: "Select format",
    editable: true,
    index: 5,
    inputType: "select",
    label: "Select format",
    name: "dateFormat",
    placeholder: "Select format",
    renderingHints: {
      class: "sb-g-col-lg-1 required",
    },
    required: true,
    visible: true,
    range: ["DD/MM/YYYY", "YYYY/MM/DD"],
    validations: [
      {
        type: "required",
        message: "Format is required",
      },
    ],
  },
  {
    code: "autoCapture",
    dataType: "text",
    description: "Auto capture",
    editable: true,
    index: 5,
    inputType: "checkbox",
    label: "Auto capture",
    name: "autoCapture",
    placeholder: "Auto capture",
    renderingHints: {
      class: "sb-g-col-lg-1",
    },
    range: ["Yes", "No"],
    required: true,
    visible: true,
  },
];
export const creationContextMock: any = {
  objectType: "question",
  collectionObjectType: "QuestionSet",
  isReadOnlyMode: true,
  unitIdentifier: "do_11330102570702438417",
  correctionComments: "",
  mode: "sourcingreview",
  editableFields: {
    orgreview: ["name", "learningOutcome"],
    sourcingreview: ["name", "learningOutcome"],
  },
};

export const mockTreeService = {
    getChildren: () => {
        return ['do_11330103476396851218', 'do_233'];
    },
    getActiveNode: () => {
        return {
            data: {
                id : 'do_11330103476396851218'
            },
            getParent: () => {
                return {
                    getChildren: () => {
                        return [{
                            data: {
                                id : 'do_11330103476396851218'
                            }
                        }];
                    }
                };
            }
        };
    }
};

export const mockEditorCursor = {
  setQuestionMap: () => {},
  clearQuestionMap: () => {},
};

export const childMetaData = {
  allowMultiSelect: "Yes",
  evidenceMimeType: ["audio"],
  markAsNotMandatory: "No",
  name: "MCQ Question",
  remarksLimit: "100",
  showEvidence: "Yes",
  showRemarks: "Yes",
  dateFormat: "dd/mm/yyyy",
  autoCapture: "Yes",
  numberOnly: "Yes",
  characterLimit: "50",
};

export const HierarchyMockData = {
  do_1133610108714352641210: {
    name: "Observation",
    children: ["do_1133850220538183681722", "do_1133850220538019841720"],
    root: true,
  },
  do_1133850220538183681722: {
    name: "School InfraStructure",
    children: [
      "do_1133850224897638401724",
      "do_1133850228043038721726",
      "do_1133867265349795841865",
      "d07b76a3-56e0-7660-4b49-a556376ae813",
    ],
    root: false,
  },
  do_1133850220538019841720: {
    name: "Midday meal",
    children: [],
    root: false,
  },
};

export const BranchingLogic = {
  do_1134355569264885761166: {
    target: ["do_1134355571590184961168", "do_1134355574936780801170"],
    preCondition: {},
    source: [],
  },
  do_1134355571590184961168: {
    target: [],
    source: ["do_1134355569264885761166"],
    preCondition: {
      and: [
        {
          ne: [
            {
              var: "do_1134355569264885761166.response1.value",
              type: "responseDeclaration",
            },
            [0],
          ],
        },
      ],
    },
  },
  do_1134355574936780801170: {
    target: [],
    source: ["do_1134355569264885761166"],
    preCondition: {
      and: [
        {
          eq: [
            {
              var: "do_1134355569264885761166.response1.value",
              type: "responseDeclaration",
            },
            [1],
          ],
        },
      ],
    },
  },
};

export const interactionChoiceEditorState = {
  question: '<p>q</p>',
  options: [
      {
          body: '<p>a</p>'
      },
      {
          body: '<p>b</p>'
      }
  ],
  templateId: 'mcq-vertical',
  answer: '0',
  numberOfOptions: 2,
  interactions: {
      response1: {
          type: 'choice',
          options: [
              {
                  label: '<p>a</p>',
                  value: 0
              },
              {
                  label: '<p>b</p>',
                  value: 1
              }
          ]
      },
      validation: {
          required: 'Yes'
      }
  },
  name: 'Multiple Choice Question',
  responseDeclaration: {
      response1: {
          maxScore: 1,
          cardinality: 'single',
          type: 'integer',
          correctResponse: {
              value: '0',
              outcomes: {
                  SCOR: 1
              }
          },
          mapping: []
      }
  },
  interactionTypes: [
      'choice'
  ],
  editorState: {
      options: [
          {
              answer: true,
              value: {
                  body: '<p>a</p>',
                  value: 0
              }
          },
          {
              answer: false,
              value: {
                  body: '<p>b</p>',
                  value: 1
              }
          }
      ],
      question: '<p>q</p>'
  },
  qType: 'MCQ',
  primaryCategory: 'Multiple Choice Question'
};
