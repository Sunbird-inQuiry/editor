import { DataService } from './../data/data.service';
import { editorConfig } from './../../components/editor/editor.component.spec.data';
import { TestBed } from '@angular/core/testing';
import { EditorService } from './editor.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import { ConfigService } from '../config/config.service';
import * as urlConfig from '../../services/config/url.config.json';
import * as labelConfig from '../../services/config/label.config.json';
import * as categoryConfig from '../../services/config/category.config.json';
import { of } from 'rxjs';
import { PublicDataService } from '../public-data/public-data.service';
import { ToasterService} from '../../services/toaster/toaster.service';
import { TreeService } from '../tree/tree.service';
import * as mockData from './editor.service.spec.data';
import { map } from 'rxjs/operators';
import * as _ from 'lodash-es';

describe('EditorService', () => {
  let editorService: EditorService;
  const configStub = {
    urlConFig: (urlConfig as any).default,
    labelConfig: (labelConfig as any).default,
    categoryConfig: (categoryConfig as any).default
  };
  const configServiceData = {
    labelConfig: {
      messages: {
        success: {
          '011': 'File downloaded'
        },
      }
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HttpClient,
        DataService,
        PublicDataService,
        { provide: ConfigService, useValue: configStub }]
    });
    editorService = TestBed.get(EditorService);
    editorService.initialize(editorConfig);
  });

  it('should be created', () => {
    const service: EditorService = TestBed.get(EditorService);
    expect(service).toBeTruthy();
  });

  it('#selectedChildren() it should return set values only', ()=> {
    editorService.selectedChildren = {
      primaryCategory: 'Course Unit',
      mimeType: 'application/vnd.ekstep.content-collection',
      interactionType: null
    };
    expect(editorService.selectedChildren).toEqual({
      primaryCategory: 'Course Unit',
      mimeType: 'application/vnd.ekstep.content-collection'
    });
    editorService.selectedChildren = {
      primaryCategory: 'Course Unit',
      mimeType: 'application/vnd.ekstep.content-collection',
      interactionType: 'test'
    };
    expect(editorService.selectedChildren).toEqual({
      primaryCategory: 'Course Unit',
      mimeType: 'application/vnd.ekstep.content-collection',
      interactionType: 'test'
    });
  });

  it('#editorConfig should return editor config', ()=> {
    expect(editorService.editorConfig).toBeTruthy();
  });

  it('it should return #editorMode = edit', ()=> {
    expect(editorService.editorMode).toEqual('edit');
  });

  it('it should return #contentPolicyUrl', ()=> {
    expect(editorService.contentPolicyUrl).toEqual('/term-of-use.html');
  });

  it('#getToolbarConfig should return toolbar config', ()=> {
    const result = editorService.getToolbarConfig();
    expect(result).toBeTruthy();
  });

  it('#emitshowLibraryPageEvent() should call #showLibraryPage.emit event', ()=> {
    spyOn(editorService.showLibraryPage, 'emit');
    editorService.emitshowLibraryPageEvent('test');
    expect(editorService.showLibraryPage.emit).toHaveBeenCalledWith('test');
  });

  it('#contentsCountAddedInLibraryPage() should increase value of contentsCount', () => {
    const service: EditorService = TestBed.get(EditorService);
    service.contentsCount = 0;
    service.contentsCountAddedInLibraryPage(undefined);
    expect(service.contentsCount).toBe(1);
  });

  it('#contentsCountAddedInLibraryPage() should set value of contentsCount to zero', () => {
    const service: EditorService = TestBed.get(EditorService);
    service.contentsCount = 2;
    service.contentsCountAddedInLibraryPage(true);
    expect(service.contentsCount).toBe(0);
  });

  it('#getshowLibraryPageEmitter() should return event emitter object', ()=> {
    const result: EventEmitter<number> = editorService.getshowLibraryPageEmitter();
    expect(result).toBeTruthy();
  });

  it('#getQuestionList() should return question list', async()=> {
    const questionIds: string[] = [
      "do_11330103476396851218",
      "do_113301035530600448110"
    ];
    const dataService = TestBed.get(DataService);
    spyOn(dataService, 'post').and.returnValue(of({
      "id": "api.questions.list",
      "result": {
        "questions": [
        ],
        "count": 0
      }
    }));
    editorService.getQuestionList(questionIds).subscribe(data => {
      expect(data.questions).toBeTruthy();
    });
  });

  it('#fetchCollectionHierarchy() should return collection hierarchy', async()=> {
    const collectionId = 'do_11330102570702438417';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'get').and.returnValue(of({"responseCode": "OK"}));
    editorService.fetchCollectionHierarchy(collectionId).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#readQuestionSet() should return question set', async()=> {
    const questionSetId = 'do_11330102570702438417';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'get').and.returnValue(of({"responseCode": "OK"}));
    editorService.readQuestionSet(questionSetId).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#fetchContentDetails() should return content details', async()=> {
    const contentId = 'do_113297001817145344190';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'get').and.returnValue(of({"responseCode": "OK"}));
    editorService.fetchContentDetails(contentId).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#updateHierarchy() should update hierarchy', async()=> {
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(editorService, 'getCollectionHierarchy').and.callFake(()=>{
      return {
        "id": "api.content.hierarchy.get",
        "ver": "3.0",
        "ts": "2021-06-29T09:17:27ZZ",
        "responseCode": "OK",
        "result": {
          "content": {}
        }
      };
    })
    spyOn(publicDataService, 'patch').and.returnValue(of({"responseCode": "OK"}));
    editorService.updateHierarchy().subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#reviewContent() should update hierarchy', async()=> {
    const contentId = 'do_11326714211239526417';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of({"responseCode": "OK"}));
    editorService.reviewContent(contentId).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#submitRequestChanges() should submit change request', async()=> {
    const contentId = 'do_11326714211239526417';
    const comment = 'No appropriate description'
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of({"responseCode": "OK"}));
    editorService.submitRequestChanges(contentId, comment).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#publishContent() should publish content when API success', async()=> {
    const contentId = 'do_11326714211239526417';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of({"responseCode": "OK"}));
    editorService.publishContent(contentId, {}).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#addResourceToHierarchy() should add resouce to hierarchy when API success', async()=> {
    const collection = 'do_11326714211239526417';
    const unitIdentifier = 'do_11326714211239526417';
    const contentId = 'do_11326714211239526417';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'patch').and.returnValue(of({"responseCode": "OK"}));
    editorService.addResourceToHierarchy(collection, unitIdentifier, contentId).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#getCategoryDefinition() should return #objectCategoryDefinition when API success ', async()=> {
    const categoryName = 'objectMetadata';
    const channel = 'forms';
    const objectType = 'name';
    const publicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of({"responseCode": "OK"}));
    editorService.getCategoryDefinition(categoryName, channel, objectType).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    });
  });

  it('#checkIfContentsCanbeAdded() should return true', ()=> {
    editorService.contentsCount = 0;
    spyOn(editorService, 'getContentChildrens').and.callFake(() => []);
    let result = editorService.checkIfContentsCanbeAdded();
    expect(editorService.getContentChildrens).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('#checkIfContentsCanbeAdded() should return false', () => {
    spyOn(editorService.treeService, 'getTreeObject').and.callFake(() => undefined);
    const content = editorService.getHierarchyFolder();
    expect(editorService.treeService.getTreeObject).toHaveBeenCalled();
    expect(content.length).toEqual(0);
  });
  it('#checkIfContentsCanbeAdded() should return false', ()=> {
    editorService.contentsCount = 0;
    spyOn(editorService, 'getContentChildrens').and.callFake(() => [1,2,3,4,5,6,7,8,9,10]);
    let result = editorService.checkIfContentsCanbeAdded();
    expect(editorService.getContentChildrens).toHaveBeenCalled();
    expect(result).toBe(false);
  });
  it('#downloadBlobUrlFile() should download the file', () => {
    const service: EditorService = TestBed.get(EditorService);
    const http = TestBed.get(HttpClient);
    const toasterService = TestBed.get(ToasterService);
    spyOn(toasterService, 'success').and.callThrough();
    spyOn(URL, 'createObjectURL').and.callFake((data) => { });
    spyOn(http, 'get').and.returnValue(of({ test: 'ok' }));
    const downloadConfig = {
      // tslint:disable-next-line:max-line-length
      blobUrl: 'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/content/textbook/toc/do_113312173590659072160_dev-testing-1_1625022971409.csv',
      successMessage: 'File downloaded',
      fileType: 'csv',
      fileName: 'do_113312173590659072160'
    };
    service.downloadBlobUrlFile(downloadConfig);
    expect(http.get).toHaveBeenCalled();
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(downloadConfig.blobUrl, { responseType: 'blob' });
    expect(toasterService.success).toHaveBeenCalledWith(configServiceData.labelConfig.messages.success['011']);
  });
  it('#downloadBlobUrlFile() should download the file and dose not show toaster message', () => {
    const service: EditorService = TestBed.get(EditorService);
    const http = TestBed.get(HttpClient);
    const toasterService = TestBed.get(ToasterService);
    spyOn(toasterService, 'success').and.callThrough();
    spyOn(URL, 'createObjectURL').and.callFake((data) => { });
    spyOn(http, 'get').and.returnValue(of({ test: 'ok' }));
    const downloadConfig = {
      // tslint:disable-next-line:max-line-length
      blobUrl: 'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/content/textbook/toc/do_113312173590659072160_dev-testing-1_1625022971409.csv',
      successMessage: false,
      fileType: 'csv',
      fileName: 'do_113312173590659072160'
    };
    service.downloadBlobUrlFile(downloadConfig);
    expect(http.get).toHaveBeenCalled();
    expect(http.get).toHaveBeenCalledTimes(1);
    expect(http.get).toHaveBeenCalledWith(downloadConfig.blobUrl, { responseType: 'blob' });
    expect(toasterService.success).not.toHaveBeenCalledWith(configServiceData.labelConfig.messages.success['011']);
  });
  it('#downloadHierarchyCsv() should downloadHierarchyCsv', async () => {
    const publicDataService: PublicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'get').and.returnValue(of({
      id: 'api.collection.export',
      ver: '4.0',
      ts: '2021-07-05T07:43:10ZZ',
      params: {
        resmsgid: 'd54936f9-9f9a-449a-a797-5564d5a97c6c',
        msgid: null,
        err: null,
        status: 'successful',
        errmsg: null
      },
      responseCode: 'OK',
      result: {
        collection: {
          // tslint:disable-next-line:max-line-length
          tocUrl: 'https://sunbirddev.blob.core.windows.net/sunbird-content-dev/content/textbook/toc/do_113312173590659072160_dev-testing-1_1625022971409.csv',
          ttl: '54000'
        }
      }
    }));
    editorService.downloadHierarchyCsv('do_113312173590659072160').subscribe(data => {
      expect(data.responseCode).toBe('OK');
    });
  });
  it('#validateCSVFile() should validateCSVFile', async () => {
    const publicDataService: PublicDataService = TestBed.get(PublicDataService);
    const file = new File([''], 'filename', { type: 'csv/text' });
    const event = {
      target: {
        files: [
          file
        ]
      }
    };
    spyOn(publicDataService, 'post').and.returnValue(of({
      id: 'api.collection.import',
      ver: '4.0',
      ts: '2021-07-05T08:28:06ZZ',
      params: {
        resmsgid: 'f151855b-98fd-4baf-b8dc-00c31cc47b71',
        msgid: null,
        err: 'INVALID_CSV_FILE',
        status: 'failed',
        errmsg: 'Please provide valid csv file. Please check for data columns without headers.'
      },
      responseCode: 'CLIENT_ERROR',
      result: {
        messages: null
      }
    }));
    editorService.validateCSVFile(event.target.files[0], 'do_113312173590659072160').subscribe(data => {
    },
      error => {
        expect(error.error.responseCode).toBe('CLIENT_ERROR');

      });
  });
  it('#generatePreSignedUrl() should call generatePreSignedUrl',  () => {
    const publicDataService: PublicDataService = TestBed.get(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of());
    const returnValue = editorService.generatePreSignedUrl({}, 'do_113312173590659072160', 'hierarchy');
    expect(publicDataService.post).toHaveBeenCalled();
    expect(returnValue).toBeDefined();
  });
});
  it('#updateCollection() should reject question for event sourcingRejectQuestion', () => {
      const collectionId = 'do_11330102570702438417';
      const event = {
        button: 'sourcingRejectQuestion',
        requestBody: {
          request: {
            questionset: {}
          }
        }
      };
      const publicDataService: PublicDataService = TestBed.get(PublicDataService);
      editorConfig.context.collectionObjectType = 'QuestionSet';
      spyOn(publicDataService, 'patch').and.returnValue(of({
          responseCode: 'OK'
      }));
      editorService.updateCollection(collectionId, event).subscribe(data => {
          expect(data.responseCode).toEqual('OK');
      });
  })

  it('#getBranchingLogicByFolder() should call', () => {
    spyOn(editorService,'getBranchingLogicByFolder').and.callThrough();
    spyOn(editorService.treeService, 'getNodeById').and.returnValue(of(treeNodeData))
    editorService.getBranchingLogicByFolder('do_113432866096922624110');
    expect(editorService.getBranchingLogicByFolder).toHaveBeenCalled();
  });

  it('#getDependentNodes() should call', () => {
    spyOn(editorService,'getDependentNodes').and.callThrough();
    spyOn(editorService.treeService, 'getNodeById').and.returnValue(of(treeNodeData))
    editorService.getDependentNodes('do_113432866096922624110');
    expect(editorService.getDependentNodes).toHaveBeenCalled();
  });

  it('#getBranchingLogicByNodeId() should call', () => {
    spyOn(editorService,'getBranchingLogicByNodeId').and.callThrough();
    spyOn(editorService.treeService, 'getNodeById').and.returnValue(of(treeNodeData))
    editorService.getBranchingLogicByNodeId('do_113432866096922624110');
    expect(editorService.getBranchingLogicByNodeId).toHaveBeenCalled();
  });

  it('#getParentDependentMap() should call', () => {
    spyOn(editorService,'getParentDependentMap').and.callThrough();
    editorService.getParentDependentMap(rootNodeData);
    expect(editorService.getParentDependentMap).toHaveBeenCalled();
  });

  it('#getFlattenedBranchingLogic() should call', () => {
    spyOn(editorService,'getFlattenedBranchingLogic');
    editorService._toFlatObjFromHierarchy(rootNodeData)
    editorService.getFlattenedBranchingLogic(rootNodeData);
    expect(editorService.getFlattenedBranchingLogic);
  });

  it('#getBranchingLogicEntry() should call', () => {
    spyOn(editorService,'getBranchingLogicEntry').and.callThrough();
    editorService.getBranchingLogicEntry(BranchingLogicData,'do_113432866799935488112');
    expect(editorService.getBranchingLogicEntry).toHaveBeenCalled();
  });

  it('#getPrimaryCategoryName() should call to get primary category name', () => {
    spyOn(editorService.treeService, 'getNodeById').and.returnValue(of(treeNodeData))
    spyOn(editorService,'getPrimaryCategoryName').and.callThrough();
    editorService.getPrimaryCategoryName('do_11326714211239526417');
    expect(editorService.getPrimaryCategoryName).toHaveBeenCalledWith('do_11326714211239526417')
  });

  it('#setQuestionIds should set questionIds', () => {
    editorService.questionIds = [];
    spyOn(editorService, 'setQuestionIds').and.callThrough();
    editorService.setQuestionIds([mockData.rootNode.children]);
    expect(editorService.questionIds).toEqual(['do_1135097615298723841131', 'do_1135097709808189441133']);
  });

  it('#getMaxScore should not call calculateMaxScore', async () => {
    spyOn(editorService.treeService, 'getFirstChild').and.returnValue({});
    spyOn(editorService, 'setQuestionIds').and.callFake(() => {});
    spyOn(await editorService, 'getQuestionList').and.callFake(() => {});
    spyOn(editorService, 'calculateMaxScore').and.callFake(() => {});
    spyOn(editorService, 'getMaxScore').and.callThrough();
    const maxScore = await editorService.getMaxScore();
    expect(editorService.treeService.getFirstChild).toHaveBeenCalled();
    expect(editorService.setQuestionIds).not.toHaveBeenCalled();
    expect(editorService.getQuestionList).not.toHaveBeenCalled();
    expect(editorService.calculateMaxScore).not.toHaveBeenCalled();
    expect(maxScore).toEqual(0);
  });

  it('#getMaxScore should return maxScore', async () => {
    spyOn(editorService.treeService, 'getFirstChild').and.returnValue(mockData.rootNode);
    spyOn(editorService, 'setQuestionIds').and.callFake(() => {
      editorService.questionIds = ['do_1135097615298723841131', 'do_1135097709808189441133'];
    });
    spyOn(await editorService, 'getQuestionList').and.returnValue(of(mockData.questionResult).pipe(map(data => _.get(data, 'result'))));
    spyOn(editorService, 'calculateMaxScore').and.callThrough();
    spyOn(editorService, 'getMaxScore').and.callThrough();
    const maxScore = await editorService.getMaxScore();
    expect(editorService.questionIds.length).toEqual(2);
    expect(editorService.getQuestionList).toHaveBeenCalled();
    expect(editorService.calculateMaxScore).toHaveBeenCalled();
    expect(maxScore).toEqual(1);
  });

  it('#calculateMaxScore should return calculated Max Score as 1', () => {
    spyOn(editorService, 'calculateMaxScore').and.callThrough();
    const questions = [{
      responseDeclaration: {
        response1: {
          maxScore: 1
        }
      },
      primaryCategory: 'Multiple Choice Question'
    }];
    const maxScore = editorService.calculateMaxScore(questions);
    expect(maxScore).toEqual(1);
  });

  it('#calculateMaxScore should return calculated Max Score as 0', () => {
    spyOn(editorService, 'calculateMaxScore').and.callThrough();
    const questions = [{
      responseDeclaration: {
        response1: {
          type: 'string'
        }
      },
      primaryCategory: 'Subjective Question'
    }];
    const maxScore = editorService.calculateMaxScore(questions);
    expect(maxScore).toEqual(0);
  });

  it('#getCollectionHierarchy should call',()=>{
    spyOn(editorService,'getCollectionHierarchy').and.callThrough();
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: { identifier: '0123'} } };
    });
    hierarchyRootNodeData.folder=true;
    editorService.getHierarchyObj(hierarchyRootNodeData,'do_113432866096922624110','do_113432866096922624110','do_1134468013653114881310');
    editorService.getCollectionHierarchy();
    expect(editorService.getCollectionHierarchy).toHaveBeenCalled();
  })

  it('#getCollectionHierarchy should call when folder false',()=>{
    spyOn(editorService,'getCollectionHierarchy').and.callThrough();
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: { identifier: '0123'} } };
    });
    hierarchyRootNodeData.folder=false;
    editorService.getHierarchyObj(hierarchyRootNodeData,'do_113432866096922624110','do_113432866096922624110','do_1134468013653114881310');
    editorService.getCollectionHierarchy();
    expect(editorService.getCollectionHierarchy).toHaveBeenCalled();
  })

  it('#getCollectionHierarchy should call when no section id and parent',()=>{
    spyOn(editorService,'getCollectionHierarchy').and.callThrough();
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: { identifier: '0123'} } };
    });
    hierarchyRootNodeData.folder=false;
    editorService.getHierarchyObj(hierarchyRootNodeData);
    editorService.getCollectionHierarchy();
    expect(editorService.getCollectionHierarchy).toHaveBeenCalled();
  })

  it('#_toFlatObjFromHierarchy should call',()=>{
    spyOn(editorService,'_toFlatObjFromHierarchy').and.callThrough();
    spyOn(treeService, 'getFirstChild').and.callFake(() => {
      return { data: { metadata: { identifier: '0123'} } };
    });
    editorService._toFlatObjFromHierarchy(rootNodeData);
    expect(editorService._toFlatObjFromHierarchy).toHaveBeenCalled();
  })
