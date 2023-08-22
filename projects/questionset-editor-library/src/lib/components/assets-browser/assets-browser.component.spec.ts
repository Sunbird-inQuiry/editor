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

const mockEditorService = {
  editorConfig: {
    config: {
      assetConfig: {
        image: {
          size: '1',
          accepted: 'png, jpeg'
        },
        video: {
          size: '50',
          accepted: 'mp4, webm'
        },
        audio: {
          size: '50',
          accepted: 'mp3, wav'
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

  appendCloudStorageHeaders: (config) => {
    return {...config, headers: {'x-ms-blob-type': 'BlockBlob'}};
  }
};

describe('AssetsBrowserComponent', () => {
  let component: AssetsBrowserComponent;
  let fixture: ComponentFixture<AssetsBrowserComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InfiniteScrollModule, HttpClientTestingModule, FormsModule],
      declarations: [AssetsBrowserComponent],
      providers: [{ provide: EditorService, useValue: mockEditorService }, QuestionService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  })

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('#ngOnInit() should call #getAcceptType()', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(component, 'getAcceptType').and.callFake(() => {return ''});
    component.ngOnInit();
    expect(component.getAcceptType).toHaveBeenCalledWith(mockEditorService.editorConfig.config.assetConfig.image.accepted, 'image');
  });

  it("#getAcceptType should return accepted content types", () => {
    const typeList = "png, jpeg";
    const type = "image";
    spyOn(component, 'getAcceptType').and.callThrough();
    const result = component.getAcceptType(typeList, type);
    expect(result).toEqual("image/png, image/jpeg");
  });

  it('#ngOnInit() should call #getAcceptType()', () => {
    spyOn(component, 'ngOnInit').and.callThrough();
    spyOn(component, 'getAcceptType').and.callFake(() => {return ''});
    component.ngOnInit();
    expect(component.getAcceptType).toHaveBeenCalledWith(mockEditorService.editorConfig.config.assetConfig.video.accepted, 'video');
  });

  it("#getAcceptType should return accepted content types", () => {
    const typeList = "mp4, webm";
    const type = "video";
    spyOn(component, 'getAcceptType').and.callThrough();
    const result = component.getAcceptType(typeList, type);
    expect(result).toEqual("video/mp4, video/webm");
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

    let questionService: QuestionService = TestBed.inject(QuestionService);
    spyOn(questionService, 'getAssetMedia').and.returnValue(of(response));
    const offset = 0;
    component.getMyAssets(offset);
    expect(component.assetsCount).toEqual(1);
  });

  it('#addAssetInEditor() should set showAssetPicker to false', () => {
    spyOn(component, 'addAssetInEditor').and.callThrough();
    component.addAssetInEditor(mockData.assetBrowserEvent.url, '12345');
    // expect(component.appIcon).toBe(mockData.assetBrowserEvent.url);
  });

  // it('#addAssetInEditor() should set appIcon value', () => {
  //   spyOn(component, 'addAssetInEditor').and.callThrough();
  //   component.addAssetInEditor(mockData.assetBrowserEvent.url, '12345');
  //   expect(component.appIcon).toBe(mockData.assetBrowserEvent.url);
  // });

  it('#addAssetInEditor() should emit proper event', () => {
    spyOn(component, 'addAssetInEditor').and.callThrough();
    spyOn(component.assetBrowserEmitter, 'emit').and.callFake(() => {});
    component.addAssetInEditor(mockData.assetBrowserEvent.url, '12345');
    expect(component.assetBrowserEmitter.emit).toHaveBeenCalledWith(mockData.assetBrowserEvent);
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
    let questionService: QuestionService = TestBed.inject(QuestionService);
    let modal = true;
    spyOn(questionService, 'createMediaAsset').and.returnValue(of(createMediaAssetResponse));
    spyOn(questionService, 'generatePreSignedUrl').and.returnValue(of(preSignedResponse));
    const editorService = TestBed.inject(EditorService);
    spyOn(editorService, 'appendCloudStorageHeaders').and.callThrough();
    spyOn(component, 'dismissPops').and.callThrough();
    component.uploadAndUseAsset(modal);
    expect(questionService.createMediaAsset).toHaveBeenCalled();
    expect(component.loading).toEqual(true);
    expect(component.isClosable).toEqual(false);
    expect(component.assetFormValid).toEqual(false);
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
  it('#generateAssetCreateRequest() should return asset create request', () => {
    let fileName = 'test';
    let fileType = 'image/png';
    let mediaType = 'image';
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

  it('#dismissAssetUploadModal() should set showAssetPicker to true', () => {
    spyOn(component, 'dismissAssetUploadModal').and.callThrough();
    component.dismissAssetUploadModal();
    expect(component.showAssetPicker).toBeTruthy();
  });

  it('#dismissAssetUploadModal() should set showAssetUploadModal to false', () => {
    spyOn(component, 'dismissAssetUploadModal').and.callThrough();
    component.dismissAssetUploadModal();
    expect(component.showAssetUploadModal).toBeFalsy();
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

  it('#uploadAsset() should create asset on API success', 
  () => {
    const file = new File([''], 'filename', { type: 'image' });
    const event = {
      target: {
        files: [
          file
        ]
      }
    }
    component.assetConfig = {
      "image": {
        "size": "1",
        "sizeType": "MB",
        "accepted": "png, jpeg"
      },
      "video": {
        "size": "50",
        "sizeType": "MB",
        "accepted": "mp4, webm"
      },
      "audio": {
        "size": "50",
        "sizeType": "MB",
        "accepted": "mp3, wav"
      }
  }

  spyOn(component, 'generateAssetCreateRequest').and.returnValue({
    name: 'flower', mediaType: 'image',
    mimeType: 'image', createdBy: '12345',
    creator: 'n11', channel: '0110986543'
  })

  spyOn(component, 'generateAssetCreateRequest').and.returnValue({
    name: 'flower', mediaType: 'video',
    mimeType: 'video', createdBy: '12345',
    creator: 'n11', channel: '0110986543'
  })
  spyOn(component, 'populateFormData').and.callFake(() => {});
  spyOn(component, 'uploadAsset').and.callThrough();
    component.uploadAsset(event);
  expect(component.assetUploadLoader).toEqual(true);
  expect(component.assetFormValid).toEqual(true);
  expect(component.generateAssetCreateRequest).toHaveBeenCalled();
  expect(component.populateFormData).toHaveBeenCalled();
})

it('#uploadAsset() should create asset on API success', 
() => {
  const file = new File([''], 'filename', { type: 'video' });
  const event = {
    target: {
      files: [
        file
      ]
    }
  }
  component.assetConfig = {
    "image": {
      "size": "1",
      "sizeType": "MB",
      "accepted": "png, jpeg"
    },
    "video": {
      "size": "50",
      "sizeType": "MB",
      "accepted": "mp4, webm"
    },
    "audio": {
      "size": "50",
      "sizeType": "MB",
      "accepted": "mp3, wav"
    }
}

spyOn(component, 'generateAssetCreateRequest').and.returnValue({
  name: 'flower', mediaType: 'video',
  mimeType: 'video', createdBy: '12345',
  creator: 'n11', channel: '0110986543'
})
spyOn(component, 'populateFormData').and.callFake(() => {});
spyOn(component, 'uploadAsset').and.callThrough();
  component.uploadAsset(event);
expect(component.assetUploadLoader).toEqual(true);
expect(component.assetFormValid).toEqual(true);
expect(component.generateAssetCreateRequest).toHaveBeenCalled();
expect(component.populateFormData).toHaveBeenCalled();
})

it('#dismissAssetPicker() should emit modalDismissEmitter  ', () => {
  component.showAssetPicker = true;
  spyOn(component, 'getMyAssets');
  spyOn(component.modalDismissEmitter, 'emit');
  component.dismissAssetPicker();
  expect(component.showAssetPicker).toBeFalsy();
  expect(component.modalDismissEmitter.emit).toHaveBeenCalledWith({});  
});

it('#ngOnDestroy() should call modal deny ', () => {
  component['modal'] = {
    deny: jasmine.createSpy('deny')
  };
  component.ngOnDestroy();
  expect(component['modal'].deny).toHaveBeenCalled();
});
it('#searchAsset() should call  getMyAssets for my images', () => {
  spyOn(component, 'getMyAssets');
  component.searchAsset('clearInput', 'myImages');
  expect(component.query).toEqual('');
  expect(component.searchMyInput).toEqual('');
  expect(component.getMyAssets).toHaveBeenCalledWith(0, '', true);
});
it('#searchAsset() should call allImages for all images ', () => {
  spyOn(component, 'getAllAssets');
  component.searchAsset('clearInput', 'allImages');
  expect(component.query).toEqual('');
  expect(component.searchAllInput).toEqual('');
  expect(component.getAllAssets).toHaveBeenCalledWith(0, '', true);
});
it('#searchAsset() should call  getMyAssets for my videos', () => {
  spyOn(component, 'getMyAssets');
  component.searchAsset('clearInput', 'myVideos');
  expect(component.query).toEqual('');
  expect(component.searchMyInput).toEqual('');
  expect(component.getMyAssets).toHaveBeenCalledWith(0, '', true);
});
it('#searchAsset() should call allVideos for all videos ', () => {
  spyOn(component, 'getAllAssets');
  component.searchAsset('clearInput', 'allVideos');
  expect(component.query).toEqual('');
  expect(component.searchAllInput).toEqual('');
  expect(component.getAllAssets).toHaveBeenCalledWith(0, '', true);
});
it('#ngOnInit() should call ngOnInit and define formConfig', () => {
  component.ngOnInit();
  expect(component.formConfig).toBeDefined();
});
it('#onStatusChanges() should call onStatusChanges and assetUploadLoader is false', () => {
  component.assetUploadLoader = false;
  const data = {
    controls: [],
    isDirty: true,
    isInvalid: false,
    isPristine: false,
    isValid: true
  };
  component.onStatusChanges(data);
  expect(component.assetFormValid).toBeFalsy();
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
it('#openAssetUploadModal() should reset upload image form  ', () => {
  component.openAssetUploadModal();
  expect(component.assetUploadLoader).toBeFalsy();
  expect(component.assetFormValid).toBeFalsy();
  expect(component.showAssetUploadModal).toBeTruthy();
  expect(component.formData).toBeNull();
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
it('#dismissAssetPicker() should emit modalDismissEmitter event  ', () => {
  spyOn(component, 'dismissAssetPicker');
  component.dismissAssetPicker();
  expect(component.dismissAssetPicker).toHaveBeenCalled();
  expect(component.showAssetPicker).toBeFalsy();
});
});
