import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { QuestionService } from './../../services/question/question.service';
import { AssetsBrowserComponent } from './assets-browser.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditorService } from '../../services/editor/editor.service';
import { of, throwError } from 'rxjs';
import * as _ from 'lodash-es';
import { mockData } from './assets-browser.component.spec.data';
import { ConfigService } from '../../services/config/config.service';
import { ToasterService } from '../../services/toaster/toaster.service';

const mockEditorService = {
  editorConfig: {
    config: {
      assetConfig: {
        video: {
          size: '50',
          accepted: 'mp4, webm'
        }
      }
    },
    context: {
      user: {
        id: 123,
        fullName: 'Ram Gopal'
      },
      channel: 'sunbird'
    }
  },
  apiErrorHandling: () => {},
  appendCloudStorageHeaders: (config) => {
    return {...config, headers: {'x-ms-blob-type': 'BlockBlob'}};
  }
};

describe('AssetsBrowserComponent', () => {
  let component: AssetsBrowserComponent;
  let fixture: ComponentFixture<AssetsBrowserComponent>;
  let editorService
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InfiniteScrollModule, HttpClientTestingModule, FormsModule],
      declarations: [AssetsBrowserComponent],
      providers: [{ provide: EditorService, useValue: mockEditorService }, QuestionService, ConfigService, ToasterService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsBrowserComponent);
    component = fixture.componentInstance;
    editorService = TestBed.inject(EditorService);
    component.assetType = "video";
    // fixture.detectChanges();
  })
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnInit() should call #getAcceptType()', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    component.assetType="video";
    spyOn(editorService.editorConfig.config.assetConfig, 'video').and.returnValue({
      size: '50',
      sizeType: 'MB',
    });
    component.ngOnInit();
    // expect(component.astSize).toEqual(mockEditorService.editorConfig.config.assetConfig.video.size);
    // expect(component.astSizeType).toEqual('MB');
    // expect(component.getAcceptType).toHaveBeenCalledWith(mockEditorService.editorConfig.config.assetConfig.video.accepted, 'video');
  });

  it("#getAcceptType should return accepted content types", () => {
    const typeList = "mp4, webm";
    const type = "video";
    spyOn(component, 'getAcceptType').and.callThrough();
    const result = component.getAcceptType(typeList, type);
    expect(result).toEqual("video/mp4,video/webm");
  });


  it('should update showAssetPicker when ngOnChanges is called', () => {
    component.assetShow = true;
    component.ngOnChanges();
    expect(component.showAssetPicker).toBe(true);
  });

  it('#initializeAssetPicker() should set showAssetPicker to true', () => {
    component.showAssetPicker = false;
    spyOn(component, 'initializeAssetPicker').and.callThrough();
    component.initializeAssetPicker();
    expect(component.showAssetPicker).toBeTruthy();
  });

  it('#outputEventHandler() should log event', () => {
    spyOn(component, 'outputEventHandler').and.callThrough();
    component.outputEventHandler({});
    expect(component.outputEventHandler).toHaveBeenCalled();
  });

  it('#getMyAssets() should return assets on API success',
  async () => {
    const response = mockData.serverResponse;
    response.result = {
      count: 1,
      content: [{
        downloadUrl: '/test'
      }]
    }
    component.assetType = "video";
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(of(response));
    const offset = 0;
    component.getMyAssets(offset);
    expect(component.assetsCount).toEqual(1);
  });

  it('#getMyAssets() should return assets on API success',
  async () => {
    const response = mockData.serverResponse;
    response.result = {
      count: 1,
      content: [{
        downloadUrl: '/test'
      }]
    }
    component.assetType = "video";
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(of(response));
    const offset = 0;
    const query = "test";
    component.getMyAssets(offset, query);
    expect(component.assetsCount).toEqual(1);
  });

  it('#getAllAssets() should return assets on API success', async () => {
    const response = mockData.serverResponse;
    response.result = {
      count: 1,
      content: [{
        downloadUrl: '/test'
      }]
    }
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(of(response));
    const offset = 0;
    component.getAllAssets(offset);
    spyOn(component.allAssets, 'push'); // feels like not needed
    expect(component.assetsCount).toEqual(1);
  });

  it('#getAllAssets() should return assets on API success', async () => {
    const response = mockData.serverResponse;
    response.result = {
      count: 1,
      content: [{
        downloadUrl: '/test'
      }]
    }
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(of(response));
    const offset = 0;
    const query = "test";
    component.getAllAssets(offset, query);;
    spyOn(component.allAssets, 'push');
    expect(component.assetsCount).toEqual(1);
  });
  xit('should handle API error gracefully', () => {
    const mockError = { status: 500, message: 'Server Error' };
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(throwError(mockError));
    spyOn(editorService, "apiErrorHandling").and.callFake(() => {});
    spyOn(component, 'getMyAssets').and.callThrough();
    component.getMyAssets(0);
  });

  it('#resetFormData() should reset the form data', () => {
    component.initialFormConfig = mockData.uploadIconFormConfig;
    spyOn(component, 'resetFormData').and.callThrough();
    component.resetFormData();
    expect(component.assetUploadLoader).toEqual(false);
    expect(component.assetFormValid).toEqual(false);
    expect(component.formConfig).toBeDefined();
  })

  xit('#uploadAndUseAsset should upload asset on API success', async () => {
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    spyOn(component, 'uploadAndUseAsset').and.callThrough();
    let questionService: QuestionService = TestBed.inject(QuestionService);
    let modal = true;
    spyOn(questionService, 'createMediaAsset').and.returnValue(of(createMediaAssetResponse));
    spyOn(questionService, 'generatePreSignedUrl').and.returnValue(of(preSignedResponse));
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'appendCloudStorageHeaders').and.callThrough();
    component.uploadAndUseAsset(modal);
    expect(questionService.createMediaAsset).toHaveBeenCalled();
  });

  it('#updateContentWithURL should update asset with url', async () => {
    let fileURL = 'video/webm';
    let mimeType = 'video';
    let contentId = 'do_123';
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'uploadMedia').and.returnValue(of(createMediaAssetResponse));
    spyOn(component, 'updateContentWithURL').and.callThrough();
    spyOn(component, 'getUploadAsset').and.callFake(() => {});
    component.updateContentWithURL(fileURL, mimeType, contentId);
  });

  it('#should add asset for uploading new image asset', async () => {
    component.isAppIcon = false;
    component.selectedAsset = undefined;
    component.showAssetPicker = true;
    const selectedAssetData = {
      src: '/test.png',
      downloadUrl: '/test.png'
    }
    const modal = {
      deny: jasmine.createSpy('deny')
    };
    spyOn(component, 'getUploadAsset').and.callThrough();
    spyOn(component, 'getMediaOriginURL').and.returnValue(of('/test.png'));
    spyOn(component, 'addAssetInEditor').and.callThrough();
    component.addAssetInEditor(modal, selectedAssetData);
  });

  it('#should add asset for uploading new image asset for appIcon', async () => {
    component.isAppIcon = true;
    component.selectedAsset = undefined;
    const selectedAssetData = {
      src: '/test.png',
      downloadUrl: '/test.png'
    }
    const modal = {
      deny: jasmine.createSpy('deny')
    };;
    component.addAssetInEditor(modal, selectedAssetData);
  });

  it('#should add asset for existing video asset', async () => {
    component.isAppIcon = false;
    component.selectedAsset = {
      src: '/test.mp4',
      downloadUrl: '/test.mp4',
      thumbnail: '/test-thubmbnail.png'
    };
    component.showAssetPicker = true;
    const modal = {
      deny: jasmine.createSpy('deny')
    };
    spyOn(component, 'getUploadAsset').and.callThrough();
    spyOn(component, 'getMediaOriginURL').and.returnValue(of('/test'));
    spyOn(component, 'addAssetInEditor').and.callThrough();
    component.addAssetInEditor(modal);
  });
 
  it('#getMediaOriginURL() should emit media origin url', () => {
    let url = '/test';
    spyOn(component, 'getMediaOriginURL').and.callThrough();
    const src = 'https://example.com/image.jpg';

    const result = component.getMediaOriginURL(src);

    expect(result).toEqual(src);
  }); 

  it('#getMediaOriginURL() should replace cloud storage URL with assetProxyUrl', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [
      'https://storage-url1.com/',
      'https://storage-url2.com/'
    ];
    const src = 'https://storage-url1.com/video.mp3';
    const result = component.getMediaOriginURL(src);
    expect(result).toEqual('https://asset-proxy.com/video.mp3');
  }); 

  it('#getMediaOriginURL() should handle no matches', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [
      'https://storage-url1.com/',
      'https://storage-url2.com/'
    ];
    const src = 'https://unrelated-url.com/video.mp3';
    const result = component.getMediaOriginURL(src);
    expect(result).toEqual('https://unrelated-url.com/video.mp3');
  }); 
    
  it('#getMediaOriginURL() should handle empty cloudStorageUrls', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [];
    const src = 'https://storage-url1.com/video.mp3';
    const result = component.getMediaOriginURL(src);
    expect(result).toEqual('https://storage-url1.com/video.mp3');
  }); 

  it('#uploadAsset() should create asset on API success', () => {
    const file = new File([''], 'filename', { type: 'video' });
    const event = {
      target: {
        files: [
          file
        ]
      }
    }
    component.assetConfig = {
      "video": {
        "size": "50",
        "sizeType": "MB",
        "accepted": "mp4, webm"
      }
      }
    spyOn(component, 'uploadAsset').and.callThrough();
    component.uploadAsset(event);
    expect(component.assetUploadLoader).toEqual(true);
    expect(component.assetFormValid).toEqual(true);
  })

  it('#generateAssetCreateRequest() should return asset create request', () => {
    let fileName = 'test';
    let fileType = 'video/webm';
    let mediaType = 'video';
    const result = component.generateAssetCreateRequest(fileName, fileType, mediaType);
    expect(result).toEqual({
      name: fileName,
      mediaType,
      mimeType: fileType,
      createdBy: _.get(mockEditorService.editorConfig, 'context.user.id'),
      creator: _.get(mockEditorService.editorConfig, 'context.user.fullName'),
      channel: _.get(mockEditorService.editorConfig, 'context.channel')
    })
  });

  xit('#uploadAndUseAsset should upload asset and call upload to blob',
  async () => {
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test?'
    }
    const uploadMediaResponse = mockData.serverResponse;
    uploadMediaResponse.result = {
      node_id: 'do_234',
      content_url: '/test'
    }
    component.showAssetUploadModal = false;
    let questionService: QuestionService = TestBed.inject(QuestionService);
    let modal = true;
    spyOn(questionService, 'createMediaAsset').and.returnValue(of(createMediaAssetResponse));
    spyOn(component, 'uploadToBlob').and.returnValue(of(true));
    spyOn(questionService, 'uploadMedia').and.returnValue(of(uploadMediaResponse));
    spyOn(component, 'addAssetInEditor').and.callThrough();
    spyOn(component, 'dismissPops').and.callFake(()=> {});
    spyOn(component, 'uploadAndUseAsset').and.callThrough();
    component.uploadAndUseAsset(modal);
  });

  it('should handle a valid file upload', () => {
    const event = {
      target: {
        files: [new File(['test-content'], 'filename.mp3', { type: 'audio' })]
      }
    } as any;

    component.assetType = 'audio';
    component.assetConfig = {
      audio: {
        size: 50,
        sizeType: 'MB'
      }
    };
    component.uploadAsset(event);
    expect(component.assetFile).toBeTruthy();
    expect(component.assetName).toBe('filename.mp3');
  });

  it('should handle an invalid file type', () => {
    const event = {
      target: {
        files: [new File(['test-content'], 'test-file.exe', { type: 'txt' })]
      }
    } as any;
    component.assetType = 'video'; 
    component.assetConfig = {
      video: {
        size: 50, 
        sizeType: 'MB'
      }
    };
    component.uploadAsset(event);
    expect(component.showErrorMsg).toBe(true);
  });

  it('#uploadToBlob() should upload blob on API success', () => {
    let signedURL = '/test';
    let file = new File([], 'fileName');
    let config = {};
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'uploadToBlob').and.returnValue(of({"responseCode": "OK"}));
    component.uploadToBlob(signedURL, file, config).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    })
  });

  it('should handle API error and throw an error', () => {
    const signedURL = 'mockedSignedURL';
    const file = 'mockedFile'; 
    const config = {}; 
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'uploadToBlob').and.returnValue(throwError({ errorMessage: 'API error' }));

    component.uploadToBlob(signedURL, file, config).subscribe(
      () => {
        // This should not be called since it's an error case
        fail('Expected error to be thrown');
      },
      (error) => {
        spyOn(editorService, "apiErrorHandling").and.callFake(() => {});
      }
    );
  });

  it('#dismissAssetUploadModal() should set showAssetPicker to true', () => {
    component.isClosable = true;
    component.showAssetUploadModal = true;
    spyOn(component, 'dismissAssetUploadModal').and.callThrough();
    component.dismissAssetUploadModal();
    expect(component.showAssetUploadModal).toBeFalsy();
  });

  it('#initiateAssetUploadModal() should set showAssetUploadModal to false', () => {
    component.showAssetPicker = true;
    component.showAssetUploadModal = false;
    component.loading = true;
    component.isClosable = false;
    spyOn(component, 'initiateAssetUploadModal').and.callThrough();
    component.initiateAssetUploadModal();
    expect(component.showAssetPicker).toBeFalsy();
    expect(component.showAssetUploadModal).toBeTruthy();
    expect(component.loading).toBeFalsy();
    expect(component.isClosable).toBeTruthy();
  });

  it('#resetFormConfig() should reset form', () => {
    component.initialFormConfig = {}
    spyOn(component, 'resetFormConfig').and.callThrough();
    component.resetFormConfig();
    expect(component.assetUploadLoader).toBeFalsy();
    expect(component.assetFormValid).toBeFalsy();
  });

  it('#lazyloadMyAssets() should get my assets', () => {
    spyOn(component, 'getMyAssets').and.callFake(() => {});
    spyOn(component, 'lazyloadMyAssets').and.callThrough();
    component.myAssets = [];
    component.query = 'test';
    component.lazyloadMyAssets();
    expect(component.getMyAssets).toHaveBeenCalledWith(0, 'test', true);
  });

  it('#lazyloadAllAssets() should get all assets', () => {
    spyOn(component, 'getAllAssets').and.callFake(() => {});
    spyOn(component, 'lazyloadAllAssets').and.callThrough();
    component.allAssets = [];
    component.query = 'test';
    component.lazyloadAllAssets();
    expect(component.getAllAssets).toHaveBeenCalledWith(0, 'test', true);
  });
  
  it('#dismissAssetPicker() should emit modalDismissEmitter  ', () => {
    component.showAssetPicker = true;
    component.assetShow = true;
    spyOn(component, 'dismissAssetPicker').and.callThrough();
    spyOn(component.assetDataOutput, 'emit').and.callFake(() => {});
    component.dismissAssetPicker();
    expect(component.showAssetPicker).toBeFalsy();
    expect(component.assetDataOutput.emit).toHaveBeenCalledWith(false);  
  });

  it('#ngOnDestroy() should call modal deny ', () => {
    component['modal'] = {
      deny: jasmine.createSpy('deny')
    };
    component.ngOnDestroy();
    expect(component['modal'].deny).toHaveBeenCalled();
  });

  it('#searchAsset() should call  getMyAssets for my videos', () => {
    spyOn(component, 'getMyAssets');
    component.searchAsset('clearInput', 'myAssets');
    expect(component.query).toEqual('');
    expect(component.searchMyInput).toEqual('');
    expect(component.getMyAssets).toHaveBeenCalledWith(0, '', true);
  });

  it('#searchAsset() should call allVideos for all videos ', () => {
    spyOn(component, 'getAllAssets').and.callFake(() => {});
    component.searchAsset('clearInput', 'allAssets');
    expect(component.query).toEqual('');
    expect(component.searchAllInput).toEqual('');
    expect(component.getAllAssets).toHaveBeenCalledWith(0, '', true);
  });

  it('#searchAsset() should call  getMyAssets for my videos', () => {
    const event = {
      target: {
        value:"testing"
      }
    }
    spyOn(component, 'getMyAssets').and.callFake(() => {});
    component.searchAsset(event, 'myAssets');
    expect(component.query).toEqual('testing');
    expect(component.searchMyInput).toEqual('');
    expect(component.getMyAssets).toHaveBeenCalledWith(0, 'testing', true);
  });

  it('#onStatusChanges() should call onStatusChanges and assetUploadLoader is false', () => {
    component.assetUploadLoader = true;
    const data = {
      controls: [],
      isDirty: true,
      isInvalid: true,
      isPristine: false,
      isValid: true
    };
    spyOn(component, 'onStatusChanges').and.callThrough();
    component.onStatusChanges(data);
    expect(component.assetFormValid).toBeTruthy();
  });

  it('#onStatusChanges() should call onStatusChanges and assetUploadLoader is true and is form valid false', () => {
    component.assetUploadLoader = true;
    const data = {
      controls: [],
      isDirty: true,
      isInvalid: false,
      isPristine: false,
      isValid: false
    };
    spyOn(component, 'onStatusChanges').and.callThrough();
    component.onStatusChanges(data);
    expect(component.assetFormValid).toBeFalsy();
  });

  it('#onStatusChanges() should call onStatusChanges and assetUploadLoader is true and is form valid true', () => {
    component.assetUploadLoader = true;
    const data = {
      controls: [],
      isDirty: true,
      isInvalid: false,
      isPristine: false,
      isValid: true
    };
    spyOn(component, 'onStatusChanges').and.callThrough();
    component.onStatusChanges(data);
    expect(component.assetFormValid).toBeTruthy();
  });

  it('#valueChanges() should define assetRequestBody ', () => {
    component.assetUploadLoader = true;
    component.assetData = mockData.formData;
    const data = {
      creator: 'Test User',
      keywords: undefined,
      name: 'logo'
    };
    spyOn(component, 'valueChanges').and.callThrough();
    component.valueChanges(data);
    expect(component.assetData).toBeDefined();
  });

  it('#openAssetUploadModal() should reset upload video form  ', () => {
    component.showAssetUploadModal = false;
    spyOn(component, 'resetFormConfig').and.callFake(() => {});
    spyOn(component, 'openAssetUploadModal').and.callThrough();
    component.openAssetUploadModal();
    expect(component.showAssetUploadModal).toBeTruthy();
  });

  it('#dismissPops() should close both pops  ', () => {
    spyOn(component, 'dismissAssetPicker').and.callFake(() => {});
    const modal = {
      deny: jasmine.createSpy('deny')
    };
    component.dismissPops(modal);
    expect(component.dismissAssetPicker).toHaveBeenCalled();
    expect(modal.deny).toHaveBeenCalled();
  });
});