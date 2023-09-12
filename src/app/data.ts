export const questionSetEditorConfig = {
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
      },
      {
        value: 'Textbook',
        label: 'Textbook'
      },
      {
        value: 'Experiential Resource',
        label: 'Experiential Resource'
      },
      {
        value: 'Explanation Video',
        label: 'Explanation Video'
      },
      {
        value: 'Focus Spot',
        label: 'Focus Spot'
      },
      {
        value: 'Learning Outcome Definition',
        label: 'Learning Outcome Definition'
      },
      {
        value: 'Marking Scheme Rubric',
        label: 'Marking Scheme Rubric'
      },
      {
        value: 'Pedagogy Flow',
        label: 'Pedagogy Flow'
      },
      {
        value: 'Lesson Plan',
        label: 'Lesson Plan'
      },
      {
        value: 'Previous Board Exam Papers',
        label: 'Previous Board Exam Papers'
      },
      {
        value: 'TV Lesson',
        label: 'TV Lesson'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
    },
    correctionComments: false,
    sourcingResourceStatus: true,
    cloudStorage: { 
      provider: 'azure',
      presigned_headers: { 
        'x-ms-blob-type': 'BlockBlob' 
      }
    }
  },
  config: {
    mode: 'edit', // edit / review / read / sourcingReview // orgReview
    enableQuestionCreation: true,
    enableAddFromLibrary: true,
    editableFields: {
      sourcingreview: ['instructions'],
      orgreview: ['name', 'instructions', 'learningOutcome'],
      review: ['name', 'description'],
    },
    maxDepth: 4,
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
      level1: {
        name: 'Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Practice Question Set',
        iconClass: 'fa fa-folder-o',
        children: {},
        addFromLibrary: true
      },
      level2: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Practice Question Set',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Subjective Question'
          ]
        },
        addFromLibrary: true
      },
      level3: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Practice Question Set',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Subjective Question'
          ]
        }
      }
    },
    contentPolicyUrl: '/term-of-use.html',
    assetProxyUrl: '/assets/public/',
    commonFrameworkLicenseUrl: 'https://creativecommons.org/licenses/'
  }
};

export const questionEditorConfig = {
  context: {
    user: {
      id: '5a587cc1-e018-4859-a0a8-e842650b9d64',
      fullName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      orgIds: ['01309282781705830427']
    },
    identifier: 'do_113395509928394752193', // do_113388220110217216123
    collectionIdentifier: 'do_1133872840783626241899',
    collectionPrimaryCategory: 'Exam Question Set',
    collectionObjectType: 'QuestionSet',
    sourcingResourceStatus: 'Review Pending',
    sourcingResourceStatusClass: 'sb-color-warning',
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
    host: 'https://dev.sunbirded.org',
    defaultLicense: 'CC BY 4.0',
    endpoint: '/data/v3/telemetry',
    env: 'questionset_editor',
    framework: 'ekstep_ncert_k-12',
    cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
                      'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/'],
    board: 'CBSE',
    medium: ['English'],
    gradeLevel: ['Class 1'],
    subject: ['Environmental Studies'],
    topic: ['Forest'],
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
      },
      {
        value: 'Textbook',
        label: 'Textbook'
      },
      {
        value: 'Experiential Resource',
        label: 'Experiential Resource'
      },
      {
        value: 'Explanation Video',
        label: 'Explanation Video'
      },
      {
        value: 'Focus Spot',
        label: 'Focus Spot'
      },
      {
        value: 'Learning Outcome Definition',
        label: 'Learning Outcome Definition'
      },
      {
        value: 'Marking Scheme Rubric',
        label: 'Marking Scheme Rubric'
      },
      {
        value: 'Pedagogy Flow',
        label: 'Pedagogy Flow'
      },
      {
        value: 'Lesson Plan',
        label: 'Lesson Plan'
      },
      {
        value: 'Previous Board Exam Papers',
        label: 'Previous Board Exam Papers'
      },
      {
        value: 'TV Lesson',
        label: 'TV Lesson'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
      reject_collection_btn_label: 'Request Changes',
    }
  },
  config: {
    mode: 'sourcingReview', // edit / review / read / sourcingReview // orgReview
    objectType: 'Question',
    primaryCategory: 'Multiple Choice Question',
    mimeType: 'application/vnd.sunbird.question',
    interactionType: 'choice',
    showSourcingStatus: true,
    showCorrectionComments: false,
    isReadOnlyMode: true,
    editableFields: {
      //sourcingreview: ['instructions'],
      orgReview: ['name', 'learningOutcome'],
      review: ['name', 'learningOutcome'],
    }
  }
};

export const observationEditorConfig = {
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
    // identifier: 'do_113395089840529408131', // 'do_1132393548335759361558', // do_11330102570702438417
    identifier: 'do_1135439342598225921356',  // 'do_1133610108714352641210', // Observation
    // identifier: 'do_113395099906416640139', // survey
    // identifier: 'do_1134357224765685761203', // Observation With Rubrics
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
    host: 'https://dock.sunbirded.org',
    defaultLicense: 'CC BY 4.0',
    endpoint: '/data/v3/telemetry',
    env: 'questionset_editor',
    framework: 'ekstep_ncert_k-12',
    cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
                      'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/'],
    subject: ['Environmental Studies'],
    topic: ['Forest'],
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
      },
      {
        value: 'Textbook',
        label: 'Textbook'
      },
      {
        value: 'Experiential Resource',
        label: 'Experiential Resource'
      },
      {
        value: 'Explanation Video',
        label: 'Explanation Video'
      },
      {
        value: 'Focus Spot',
        label: 'Focus Spot'
      },
      {
        value: 'Learning Outcome Definition',
        label: 'Learning Outcome Definition'
      },
      {
        value: 'Marking Scheme Rubric',
        label: 'Marking Scheme Rubric'
      },
      {
        value: 'Pedagogy Flow',
        label: 'Pedagogy Flow'
      },
      {
        value: 'Lesson Plan',
        label: 'Lesson Plan'
      },
      {
        value: 'Previous Board Exam Papers',
        label: 'Previous Board Exam Papers'
      },
      {
        value: 'TV Lesson',
        label: 'TV Lesson'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
    }
  },
  config: {
    mode: 'edit', // edit / review / read / sourcingReview // orgReview
    editableFields: {
      //sourcingreview: ['instructions'],
      orgreview: ['name', 'instructions', 'learningOutcome'],
      review: ['name', 'description'],
    },
    maxDepth: 4,
    objectType: 'QuestionSet',
    // primaryCategory: 'Observation',
    primaryCategory: 'Observation',
    isRoot: true,
    iconClass: 'fa fa-book',
    children: {
      Question: [
        'Multiple Choice Question',
        'Slider',
        'Text',
        'Date'
      ]
    },
    hierarchy: {
      level1: {
        name: 'Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level2: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level3: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      }
    },
    contentPolicyUrl: '/term-of-use.html'
  }
};

export const surveyEditorConfig = {
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
    // identifier: 'do_113395089840529408131', // 'do_1132393548335759361558', // do_11330102570702438417
    // identifier: 'do_11343286031200256013',  // 'do_1133610108714352641210', // Observation
    identifier: 'do_113395099906416640139', // survey
    // identifier: 'do_1134357224765685761203', // Observation With Rubrics
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
    host: 'https://dock.sunbirded.org',
    defaultLicense: 'CC BY 4.0',
    endpoint: '/data/v3/telemetry',
    env: 'questionset_editor',
    framework: 'ekstep_ncert_k-12',
    cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
                      'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/'],
    board: 'CBSE',
    medium: ['English'],
    gradeLevel: ['Class 1'],
    subject: ['Environmental Studies'],
    topic: ['Forest'],
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
      },
      {
        value: 'Textbook',
        label: 'Textbook'
      },
      {
        value: 'Experiential Resource',
        label: 'Experiential Resource'
      },
      {
        value: 'Explanation Video',
        label: 'Explanation Video'
      },
      {
        value: 'Focus Spot',
        label: 'Focus Spot'
      },
      {
        value: 'Learning Outcome Definition',
        label: 'Learning Outcome Definition'
      },
      {
        value: 'Marking Scheme Rubric',
        label: 'Marking Scheme Rubric'
      },
      {
        value: 'Pedagogy Flow',
        label: 'Pedagogy Flow'
      },
      {
        value: 'Lesson Plan',
        label: 'Lesson Plan'
      },
      {
        value: 'Previous Board Exam Papers',
        label: 'Previous Board Exam Papers'
      },
      {
        value: 'TV Lesson',
        label: 'TV Lesson'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
    }
  },
  config: {
    mode: 'edit', // edit / review / read / sourcingReview // orgReview
    editableFields: {
      //sourcingreview: ['instructions'],
      orgreview: ['name', 'instructions', 'learningOutcome'],
      review: ['name', 'description'],
    },
    maxDepth: 4,
    objectType: 'QuestionSet',
    // primaryCategory: 'Observation',
    primaryCategory: 'Survey',
    isRoot: true,
    iconClass: 'fa fa-book',
    enablePagination: true,
    children: {
      Question: [
        'Multiple Choice Question',
        'Slider',
        'Text',
        'Date'
      ]
    },
    hierarchy: {
      level1: {
        name: 'Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level2: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level3: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      }
    },
    contentPolicyUrl: '/term-of-use.html'
  }
};

export const observationRubricsEditorConfig = {
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
    // identifier: 'do_113395089840529408131', // 'do_1132393548335759361558', // do_11330102570702438417
    // identifier: 'do_11343286031200256013',  // 'do_1133610108714352641210', // Observation
    // identifier: 'do_113395099906416640139', // survey
    identifier: 'do_1134357224765685761203', // Observation With Rubrics Framework - tpd
    // identifier: 'do_113437470826086400127', // Observation With Rubrics Framework - nit_tpd
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
    host: 'https://dock.sunbirded.org',
    defaultLicense: 'CC BY 4.0',
    endpoint: '/data/v3/telemetry',
    env: 'questionset_editor',
    framework: 'tpd',
    cloudStorageUrls: ['https://s3.ap-south-1.amazonaws.com/ekstep-public-qa/', 'https://ekstep-public-qa.s3-ap-south-1.amazonaws.com/',
                      'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/'],
    board: 'CBSE',
    medium: ['English'],
    gradeLevel: ['Class 1'],
    subject: ['Environmental Studies'],
    topic: ['Forest'],
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
      },
      {
        value: 'Textbook',
        label: 'Textbook'
      },
      {
        value: 'Experiential Resource',
        label: 'Experiential Resource'
      },
      {
        value: 'Explanation Video',
        label: 'Explanation Video'
      },
      {
        value: 'Focus Spot',
        label: 'Focus Spot'
      },
      {
        value: 'Learning Outcome Definition',
        label: 'Learning Outcome Definition'
      },
      {
        value: 'Marking Scheme Rubric',
        label: 'Marking Scheme Rubric'
      },
      {
        value: 'Pedagogy Flow',
        label: 'Pedagogy Flow'
      },
      {
        value: 'Lesson Plan',
        label: 'Lesson Plan'
      },
      {
        value: 'Previous Board Exam Papers',
        label: 'Previous Board Exam Papers'
      },
      {
        value: 'TV Lesson',
        label: 'TV Lesson'
      }
    ],
    labels: {
      save_collection_btn_label: 'Save as Draft',
    }
  },
  config: {
    mode: 'edit', // edit / review / read / sourcingReview // orgReview
    editableFields: {
      //sourcingreview: ['instructions'],
      orgreview: ['name', 'instructions', 'learningOutcome'],
      review: ['name', 'description'],
    },
    maxDepth: 4,
    objectType: 'QuestionSet',
    // primaryCategory: 'Observation',
    primaryCategory: 'Observation With rubrics',
    isRoot: true,
    iconClass: 'fa fa-book',
    enablePagination:true,
    children: {
      Question: [
        'Multiple Choice Question',
        'Slider',
        'Text',
        'Date'
      ]
    },
    hierarchy: {
      level1: {
        name: 'Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level2: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      },
      level3: {
        name: 'Sub Section',
        type: 'Unit',
        mimeType: 'application/vnd.sunbird.questionset',
        primaryCategory: 'Observation',
        iconClass: 'fa fa-folder-o',
        children: {
          Question: [
            'Multiple Choice Question',
            'Slider',
            'Text',
            'Date'
          ]
        }
      }
    },
    contentPolicyUrl: '/term-of-use.html'
  }
};
