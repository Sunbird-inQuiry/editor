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
import { mockData } from '../asset-browser/asset-browser.component.spec.data';
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
    fixture.detectChanges();
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
    spyOn(component.allAssets, 'push');
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
    component.getAllAssets(offset, query);
    let modal = undefined;
    spyOn(component, 'addAssetInEditor').and.callThrough();
    // spyOn(component.assetDataOutput, 'emit').and.callFake(() => {});
    component.addAssetInEditor(modal);
    spyOn(component.allAssets, 'push');
    expect(component.assetsCount).toEqual(1);
  });
  it('should handle API error gracefully', () => {
    const mockError = { status: 500, message: 'Server Error' };
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(throwError(mockError));
    spyOn(editorService, "apiErrorHandling").and.callFake(() => {});
  });

  it('#resetFormData() should reset the form data', () => {
    component.resetFormData();
    expect(component.assetUploadLoader).toEqual(false);
    expect(component.assetFormValid).toEqual(false);
    expect(component.formConfig).toBeTruthy();
  })

  it('#uploadAndUseAsset should upload asset on API success', async () => {
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    expect(component.loading).toEqual(false);
    expect(component.isClosable).toEqual(true);
    expect(component.assetFormValid).toEqual(false);
    spyOn(component, 'uploadAndUseAsset').and.callThrough();
    let questionService: QuestionService = TestBed.inject(QuestionService);
    let modal = true;
    spyOn(questionService, 'createMediaAsset').and.returnValue(of(createMediaAssetResponse));
    spyOn(questionService, 'generatePreSignedUrl').and.returnValue(of(preSignedResponse));
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'appendCloudStorageHeaders').and.callThrough();
    spyOn(component, 'dismissPops').and.callThrough();
    component.uploadAndUseAsset(modal);
    expect(questionService.createMediaAsset).toHaveBeenCalled();
  });
  it('#updateContentWithURL should update asset with url', async () => {
    let fileURL = 'video/webm';
    let mimeType = 'video';
    let contentId = 'do_123';
    const data = new FormData();
    data.append('fileUrl', fileURL);
    data.append('mimeType', mimeType);
    
    const conf = {
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      cache: false
    };
    const option = {
      data,
      param: conf
    };
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    spyOn(component, 'updateContentWithURL').and.callThrough();
    component.updateContentWithURL(fileURL, mimeType, contentId);
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getQuestionList').and.returnValue(throwError({}));
    let modal = true;
    spyOn(questionService, 'uploadMedia').and.returnValue(of(createMediaAssetResponse));
    component.getUploadAsset(createMediaAssetResponse.result['node_id'], modal);
  });
  it('should handle error correctly', () => {
    const fileURL = 'mockFileURL';
    const mimeType = 'mockMimeType';
    const contentId = 'mockContentId';
    const modal = 'mockModal';
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'uploadMedia').and.returnValue(
      throwError({ message: 'Mock error' })
    );
    let configService: ConfigService = TestBed.inject(ConfigService);
    spyOn(configService, 'labelConfig').and.returnValue({ messages: { error: { '027': 'MockErrorMessage' } } });

    spyOn(editorService, "apiErrorHandling").and.callFake(() => {});

    component.updateContentWithURL(fileURL, mimeType, contentId, modal);

    expect(questionService.uploadMedia).toHaveBeenCalledOnceWith(jasmine.anything(), contentId);
    expect(component.isClosable).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.assetFormValid).toBe(true);
  });
  it('#updateContentWithURL should update asset with url', async () => {
    let fileURL = 'video/webm';
    let mimeType = 'video';
    let contentId = 'do_123';
    const data = new FormData();
    data.append('fileUrl', fileURL);
    data.append('mimeType', mimeType);
    const conf = {
      enctype: 'multipart/form-data',
      processData: false,
      contentType: false,
      cache: false
    };
    const option = {
      data,
      param: conf
    };
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    spyOn(component, 'updateContentWithURL').and.callThrough();
    component.updateContentWithURL(fileURL, mimeType, contentId);
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getQuestionList').and.returnValue(throwError({}));
    spyOn(questionService, "uploadMedia").and.returnValue(
      throwError("error")
    );
  });
  it('#getUploadAsset should get asset', async () => {
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
    spyOn(component, 'getUploadAsset').and.callThrough();
    let questionService: QuestionService = TestBed.inject(QuestionService);
    let modal = undefined;
    spyOn(questionService, 'getVideo').and.returnValue(of(createMediaAssetResponse));
    expect(component.loading).toEqual(false);
    expect(component.isClosable).toEqual(true);
    expect(component.assetFormValid).toEqual(false);
    spyOn(component, 'addAssetInEditor').and.callThrough();
    component.addAssetInEditor(modal);
  });
  
  it('#getUploadAsset should get asset', async () => {
    const createMediaAssetResponse = mockData.serverResponse;
    createMediaAssetResponse.result = {
      node_id: 'do_123'
    }
    const preSignedResponse = mockData.serverResponse;
    preSignedResponse.result = {
      node_id: 'do_234',
      pre_signed_url: '/test'
    }
  });
  it('#addAssetInEditor() should emit proper event', () => { let modal = undefined;
    spyOn(component, 'addAssetInEditor').and.callThrough();
    // spyOn(component.assetDataOutput, 'emit').and.callFake(() => {});
    component.addAssetInEditor(modal);
    // expect(component.assetDataOutput.emit).toHaveBeenCalledWith(mockData.assetBrowserEvent);
  }); 

  it('#addAssetInEditor() should emit proper event', () => { let modal = undefined;
    component.url = '/test';
    spyOn(component, 'addAssetInEditor').and.callThrough();
    // spyOn(component.assetDataOutput, 'emit').and.callFake(() => {});
    component.addAssetInEditor(modal);
    // expect(component.assetDataOutput.emit).toHaveBeenCalledWith(mockData.assetBrowserEvent);
  }); 

  it('#getMediaOriginURL() should emit media origin url', () => {
    let src = '/test';
    spyOn(component, 'getMediaOriginURL').and.callThrough();
    // spyOn(component.assetDataOutput, 'emit').and.callFake(() => {});
    component.getMediaOriginURL(src);
    // expect(component.assetDataOutput.emit).toHaveBeenCalledWith(mockData.assetBrowserEvent);
  }); 
  it('#getMediaOriginURL() should emit media origin url', () => {
    let url = '/test';
    spyOn(component, 'getMediaOriginURL').and.callThrough();
    const src = 'https://example.com/image.jpg';

    const result = component.getMediaOriginURL(src);

    expect(result).toEqual(src); // No replacement should occur
    // expect(component.assetDataOutput.emit).toHaveBeenCalledWith(mockData.assetBrowserEvent);
  }); 

  it('#getMediaOriginURL() should replace cloud storage URL with assetProxyUrl', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [
      'https://storage-url1.com/',
      'https://storage-url2.com/'
    ];
    const src = 'https://storage-url1.com/video.mp3';

    // Act
    const result = component.getMediaOriginURL(src);

    // Assert
    expect(result).toEqual('https://asset-proxy.com/video.mp3');
  }); 

  it('#getMediaOriginURL() should handle no matches', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [
      'https://storage-url1.com/',
      'https://storage-url2.com/'
    ];
    const src = 'https://unrelated-url.com/video.mp3';
        // Assert
        const result = component.getMediaOriginURL(src);
        expect(result).toEqual('https://unrelated-url.com/video.mp3');
  }); 
    
  it('#getMediaOriginURL() should handle empty cloudStorageUrls', () => {
    component.assetProxyUrl = 'https://asset-proxy.com/';
    editorService.editorConfig.context.cloudStorageUrls = [];
    const src = 'https://storage-url1.com/video.mp3';

    // Act
    const result = component.getMediaOriginURL(src);

    // Assert
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
    expect(questionService.createMediaAsset).toHaveBeenCalled();
    expect(questionService.generatePreSignedUrl).toHaveBeenCalled();
    expect(component.uploadToBlob).toHaveBeenCalled();
  });
  it('should handle a valid file upload', () => {
    // Prepare a mock event
    const event = {
      target: {
        files: [new File(['test-content'], 'filename.mp3', { type: 'video' })]
      }
    } as any;

    component.assetType = 'video'; // Replace with your asset type
    component.assetConfig = {
      video: {
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
    spyOn(questionService.http, 'put').and.returnValue(of({"responseCode": "OK"}));
    component.uploadToBlob(signedURL, file, config).subscribe(data => {
      expect(data.responseCode).toEqual('OK');
    })
  });

  it('should upload to blob and return data', () => {
    const signedURL = 'mockedSignedURL';
    const file = 'mockedFile'; 
    const config = {}; 
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService.http, 'put').and.returnValue(of({ mockData: 'data' }));

    component.uploadToBlob(signedURL, file, config).subscribe((data) => {
      expect(data).toEqual({ mockData: 'data' }); // Assert the expected response
    });
  });

  it('should handle API error and throw an error', () => {
    const signedURL = 'mockedSignedURL';
    const file = 'mockedFile'; 
    const config = {}; 
    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService.http, 'put').and.returnValue(throwError({ errorMessage: 'API error' }));

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
    component.showAssetPicker = true;
    spyOn(component, 'dismissAssetUploadModal').and.callThrough();
    component.dismissAssetUploadModal();
    expect(component.showAssetPicker).toBeTruthy();
  });

  it('#dismissAssetUploadModal() should set showAssetUploadModal to false', () => {
    spyOn(component, 'dismissAssetUploadModal').and.callThrough();
    component.dismissAssetUploadModal();
    expect(component.showAssetUploadModal).toBeFalsy();
  });

  it('#initiateAssetUploadModal() should set showAssetUploadModal to false', () => {
    spyOn(component, 'initiateAssetUploadModal').and.callThrough();
    component.initiateAssetUploadModal();
    expect(component.showAssetPicker).toBeFalsy();
    expect(component.showAssetUploadModal).toBeTruthy();
    expect(component.loading).toBeFalsy();
    expect(component.isClosable).toBeTruthy();
  });

  it('#resetFormConfig() should reset form', () => {
    spyOn(component, 'resetFormConfig').and.callThrough();
    component.resetFormConfig();
    expect(component.assetUploadLoader).toBeFalsy();
    expect(component.assetFormValid).toBeFalsy();
    component.formConfig = component.initialFormConfig;
  });

  it('#lazyloadMyAssets() should get my assets', () => {
    spyOn(component, 'getMyAssets');
    component.lazyloadMyAssets();
    expect(component.getMyAssets).toHaveBeenCalledWith(0, undefined, true);
  });
  it('#lazyloadAllAssets() should get all assets', () => {
    spyOn(component, 'getAllAssets');
    component.lazyloadAllAssets();
    expect(component.getAllAssets).toHaveBeenCalledWith(0, undefined, true);
  });




it('#dismissAssetPicker() should emit modalDismissEmitter  ', () => {
  component.showAssetPicker = false;
  component.assetShow = false;
  spyOn(component, 'getMyAssets');
  spyOn(component.assetDataOutput, 'emit');
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
  spyOn(component, 'getAllAssets');
  component.searchAsset('clearInput', 'allAssets');
  expect(component.query).toEqual('');
  expect(component.searchAllInput).toEqual('');
  expect(component.getAllAssets).toHaveBeenCalledWith(0, '', true);
});

it('#searchAsset() should call  getMyAssets for my videos', () => {
  // spyOn(component, 'getMyAssets');
  const event = {
    target: {
      value:"testing"
    }
  }
  component.searchAsset(event, 'myAssets');
  expect(component.query).toEqual('testing');
  expect(component.searchMyInput).toEqual('');
  // expect(component.getMyAssets).toHaveBeenCalledWith(0, '', true);
});
it('#ngOnInit() should call ngOnInit and define formConfig', () => {
  component.assetType = "video";
  component.assetConfig = {
    "video": {
      "size": "50",
      "sizeType": "MB",
      "accepted": "mp4, webm"
    }
  }
  component.ngOnInit();
  expect(component.formConfig).toBeDefined();
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
  component.onStatusChanges(data);
  expect(component.assetFormValid).toBeTruthy();
});
it('#valueChanges() should define assetRequestBody ', () => {
  component.assetUploadLoader = true;
  component.assetData = mockData.formData;
  const data = {
    creator: 'Vaibahv Bhuva',
    keywords: undefined,
    name: 'logo'
  };
  component.valueChanges(data);
  expect(component.assetData).toBeDefined();
});
it('#openAssetUploadModal() should reset upload video form  ', () => {
  component.openAssetUploadModal();
  expect(component.assetUploadLoader).toBeFalsy();
  expect(component.assetFormValid).toBeFalsy();
  expect(component.showAssetUploadModal).toBeTruthy();
  expect(component.formData).toBeNull();

});
it('#resetFormData() should reset form  ', () => {
  component.openAssetUploadModal();
  expect(component.assetUploadLoader).toBeFalsy();
  expect(component.assetFormValid).toBeFalsy();
  expect(component.showAssetUploadModal).toBeTruthy();
  expect(component.formData).toBeNull();
  expect(component.isClosable).toBeTruthy();
});
it('#dismissPops() should close both pops  ', () => {
  spyOn(component, 'dismissAssetPicker');
  const modal = {
    deny: jasmine.createSpy('deny')
  };
  component.dismissPops(modal);
  expect(component.dismissAssetPicker).toHaveBeenCalled();
  expect(modal.deny).toHaveBeenCalled();
});

});