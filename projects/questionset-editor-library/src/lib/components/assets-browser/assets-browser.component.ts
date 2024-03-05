import { Component, OnInit, Output, Input, EventEmitter, OnChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as _ from 'lodash-es';
import { catchError, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { EditorService } from '../../services/editor/editor.service';
import { ConfigService } from '../../services/config/config.service';
import { QuestionService } from '../../services/question/question.service';
import { config } from './assets-browser.data';
import { ToasterService } from '../../services/toaster/toaster.service';
@Component({
  selector: 'lib-assets-browser',
  templateUrl: './assets-browser.component.html',
  styleUrls: ['./assets-browser.component.scss']
})
export class AssetsBrowserComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('editor') public editorRef: ElementRef;
  @Output() assetDataOutput = new EventEmitter<any>();
  @Input() assetShow;
  @Input() assetType;
  @Input() showAssetPicker;
  @Input() isAppIcon: boolean;
  @ViewChild('modal') private modal;
  myAssets = [];
  allAssets = [];
  selectedAsset = {};
  loading = false;
  isClosable = true;
  assetConfig: any = {};
  acceptAssetType: any;
  initialized = false;
  selectedAssetId: string;
  showAddButton: boolean;
  showErrorMsg: boolean;
  errorMsg: string;
  query: string;
  showAssetUploadModal: boolean;
  assetFormValid = false;
  selectast: string;
  myast: string;
  allast: string;
  emptySearchMessage: string;
  chooseOrDragAst: string;
  astSize: string;
  astSizeType: string;
  acceptedFileType: string;
  url: any;
  fileType: any;
  public assetData = {};
  public assetFile: any;
  public formData: any;
  public mediaobj;
  public assetsCount: any;
  public editorInstance: any;
  public editorConfig: any;
  public isAssetBrowserReadOnly = false;
  public assetProxyUrl: any;
  public initialFormConfig: any;
  public formConfig: any;
  public termsAndCondition: any;
  public assetName: any;
  public searchMyInput = '';
  public searchAllInput: any;
  public assetUploadLoader = false;
  constructor(private editorService: EditorService, public configService: ConfigService,
                private questionService: QuestionService, public toasterService: ToasterService) { }
  
  ngOnInit() {
    this.assetProxyUrl = _.get(this.editorService.editorConfig, 'config.assetProxyUrl') || _.get(this.configService.urlConFig, 'URLS.assetProxyUrl');
    this.initialFormConfig = _.get(config, 'uploadIconFormConfig');
    this.formConfig = _.get(config, 'uploadIconFormConfig');
    this.termsAndCondition =  _.get(this.configService.labelConfig, 'termsAndConditions.001');
    this.assetConfig = this.editorService.editorConfig.config.assetConfig;
    this.initialized = true;
    this.selectast = this.configService.labelConfig?.lbl?.selectAsset[this.assetType];
    this.emptySearchMessage =  _.get(this.configService.labelConfig?.emptySearchMessage[this.assetType]);
    this.myast = this.configService.labelConfig?.lbl?.myAssets[this.assetType];
    this.allast = this.configService.labelConfig?.lbl?.allAssets[this.assetType];
    this.chooseOrDragAst = this.configService.labelConfig?.lbl?.chooseOrDragAsset[this.assetType];
    this.astSize = this.assetConfig[this.assetType].size;
    this.astSizeType = this.assetConfig[this.assetType].sizeType;
    this.acceptedFileType = this.assetConfig[this.assetType].accepted;
    this.acceptAssetType = this.getAcceptType(this.assetConfig[this.assetType].accepted, this.assetType);
  }

  ngOnChanges() {
    if (this.assetShow) {
      this.showAssetPicker = true;
    }
  }

  initializeAssetPicker() {
    this.showAssetPicker = true;
  }

  outputEventHandler(event) {
    console.log(JSON.stringify(event));
  }

  getAcceptType(typeList, type) {
    const acceptTypeList = typeList.split(', ');
    const result = [];
    _.forEach(acceptTypeList, (content) => {
      result.push(`${type}/${content}`);
    });
    return result.toString();
  }
  
  dismissAssetPicker() {
    this.showAssetPicker = false;
    this.assetShow = false;
    this.assetDataOutput.emit(false);
  }
  
  
  getMyAssets(offset, query?, search?) {
  this.assetsCount = 0;
  if (!search) {
    this.searchMyInput = '';
  }
  if (offset === 0) {
    this.myAssets.length = 0;
  }
  let req;
    req = {
      filters: {
        mediaType: [this.assetType],
        createdBy: _.get(this.editorService.editorConfig, 'context.user.id')
      },
      offset
    };
   if (query) {
    req.query = query;
  }
  this.questionService.getAssetMedia(req).pipe(catchError(err => {
    let errInfo;
    errInfo =  _.get(this.configService.labelConfig?.assetSearchFailed[this.assetType]);
    return throwError(this.editorService.apiErrorHandling(err, errInfo));
  })).subscribe((res) => {
    this.assetsCount = res.result.count;
    _.map(res.result.content, (item) => {
      if (item.downloadUrl) {
        this.myAssets.push(item);
      }
    });
  });
  }
  
  getAllAssets(offset, query?, search?) {
    this.assetsCount = 0;
    if (!search) {
      this.searchAllInput = '';
    }
    if (offset === 0) {
      this.allAssets.length = 0;
    }
    let req;
      req = {
        filters: {
          mediaType: [this.assetType]
        },
        offset
      };
    if (query) {
      req.query = query;
    }
    this.questionService.getAssetMedia(req).pipe(catchError(err => {
      let errInfo;
      errInfo = _.get(this.configService.labelConfig?.assetSearchFailed[this.assetType]);
      return throwError(this.editorService.apiErrorHandling(err, errInfo));
    })).subscribe((res) => {
      this.assetsCount = res.result.count;
      _.map(res.result.content, (item) => {
        if (item.downloadUrl) {
          this.allAssets.push(item);
        }
      })
    });
  }
  
  /**
   * function to lazy load my assets
   */
  lazyloadMyAssets() {
    const offset = this.myAssets.length;
    this.getMyAssets(offset, this.query, true);
  }
  
  // search feature for images
  searchAsset(event, type) {
    if (event === 'clearInput' && type === 'myAssets') {
      this.query = '';
      this.searchMyInput = '';
    } else if (event === 'clearInput' && type === 'allAssets') {
      this.query = '';
      this.searchAllInput = '';
    } else {
      this.query = event.target.value;
    }
    if (type === 'myAssets') {
      this.getMyAssets(0, this.query, true);
    } else {
      this.getAllAssets(0, this.query, true);
    }
  }
  
  addAssetInEditor(assetModal, selectedAssetData?) {
    if(this.isAppIcon) {
      this.assetDataOutput.emit({type: 'image', url: selectedAssetData.downloadUrl});
      if (assetModal) {
        assetModal.deny();
      }
    } else {
      let assetData: any;
      if (!_.isEmpty(this.selectedAsset)) {
        assetData = _.cloneDeep(this.selectedAsset);
      } else if(!_.isEmpty(selectedAssetData)) {
        assetData = selectedAssetData;
      }
      assetData.src = this.getMediaOriginURL(assetData.downloadUrl);
      if (assetData?.thumbnail) {
        assetData.thumbnail = (assetData.thumbnail) && this.getMediaOriginURL(assetData.thumbnail);
      }
      this.showAssetPicker = false;
      this.assetDataOutput.emit(assetData);
      if (assetModal) {
        assetModal.deny();
      }
    }
  }
  
  getMediaOriginURL(src) {
    const replaceText = this.assetProxyUrl;
    const cloudStorageUrls = _.compact(_.get(this.editorService.editorConfig, 'context.cloudStorageUrls') || []);
    _.forEach(cloudStorageUrls, url => {
      if (src.indexOf(url) !== -1) {
        src = src.replace(url, replaceText);
      }
    });
    return src; 
  }
  
  /**
   * function to lazy load all images
   */
  lazyloadAllAssets() {
    const offset = this.allAssets.length;
    this.getAllAssets(offset, this.query, true);
  }
  
  openAssetUploadModal() {
    this.showAssetUploadModal = true;
    this.resetFormData();
  }
  
  resetFormData() {
    this.showErrorMsg = false;
    this.formData = null;
    this.formConfig = this.initialFormConfig;
    this.assetUploadLoader = false;
    this.assetFormValid = false;
    this.loading = false;
    this.isClosable = true;
  }
  
  dismissAssetUploadModal() {
    if (this.isClosable) {
      this.showAssetUploadModal = false;
    }
  }
  
  initiateAssetUploadModal() {
    this.showAssetPicker = false;
    this.showAssetUploadModal = true;
    this.loading = false;
    this.isClosable = true;
  }
    
  uploadAsset(event) {
    this.assetFile = event.target.files[0];
    this.assetName = this.assetFile.name;
    const reader = new FileReader();
    this.formData = new FormData();
    this.formData.append('file', this.assetFile);
    const fileType = this.assetFile.type;
    const fileName = this.assetFile.name.split('.').slice(0, -1).join('.');
    const fileSize = this.assetFile.size / 1024 / 1024;
    if (fileType.split('/')[0] === this.assetType) {
      this.showErrorMsg = false;
      if (fileSize > this.assetConfig[this.assetType].size) {
        this.showErrorMsg = true;
        this.errorMsg = _.get(this.configService.labelConfig, 'messages.error.021')
          + this.assetConfig[this.assetType].size + this.assetConfig[this.assetType].sizeType;
        this.resetFormConfig();
      } else {
        this.errorMsg = '';
        this.showErrorMsg = false;
        reader.readAsDataURL(this.assetFile);
      }
    } else {
      this.showErrorMsg = true;
      this.errorMsg = _.get(this.configService.labelConfig?.chooseFileMsg[this.assetType]);
    } 
    if (!this.showErrorMsg) {
      this.assetUploadLoader = true;
      this.assetFormValid = true;
      this.assetData = this.generateAssetCreateRequest(fileName, fileType, this.assetType);
      this.populateFormData(this.assetData);
    }
  }
  
  generateAssetCreateRequest(fileName, fileType, mediaType) {
    return {
      name: fileName,
      mediaType,
      mimeType: fileType,
      createdBy: _.get(this.editorService.editorConfig, 'context.user.id'),
      creator: _.get(this.editorService.editorConfig, 'context.user.fullName'),
      channel: _.get(this.editorService.editorConfig, 'context.channel')
    };
  }
  
  populateFormData(formData) {
    const formvalue = _.cloneDeep(this.formConfig);
    this.formConfig = null;
    _.forEach(formvalue, (formFieldCategory) => {
      formFieldCategory.default = formData[formFieldCategory.code];
    });
    this.formConfig = formvalue;
  }
  
  resetFormConfig() {
    this.assetUploadLoader = false;
    this.assetFormValid = false;
    this.formConfig = this.initialFormConfig;
  }
  
  onStatusChanges(event) {
    if (event.isValid && this.assetUploadLoader) {
      this.assetFormValid = true;
    } else {
      this.assetFormValid = false;
    }
  }
  
  valueChanges(event) {
    this.assetData = _.merge({}, this.assetData, event);
  }
  
  dismissPops(modal) {
    this.dismissAssetPicker();
    modal.deny();
  }
  
  uploadAndUseAsset(modal) {
    this.isClosable = false;
    this.loading = true;
    this.showErrorMsg = false;
    this.assetFormValid = false;
    if (!this.showErrorMsg) {
      this.questionService.createMediaAsset({ asset: this.assetData }).pipe(catchError(err => {
        this.loading = false;
        this.isClosable = true;
        this.assetFormValid = true;
        let errInfo;
        errInfo = { errorMsg: _.get(this.configService.labelConfig?.chooseFileMsg[this.assetType]) };
        return throwError(this.editorService.apiErrorHandling(err, errInfo));
      })).subscribe((res) => {
        const contentId = res.result.node_id;
        const request = {
          content: {
            fileName: this.assetName
          }
        };
        this.questionService.generatePreSignedUrl(request, contentId).pipe(catchError(err => {
          let errInfo;
          errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.026') };
          this.loading = false;
          this.isClosable = true;
          this.assetFormValid = true;
          return throwError(this.editorService.apiErrorHandling(err, errInfo)); 
        })).subscribe((response) => {
          const signedURL = response.result.pre_signed_url;
          let blobConfig = {
            processData: false,
            contentType: 'Asset'
          };
          blobConfig = this.editorService.appendCloudStorageHeaders(blobConfig);
          this.uploadToBlob(signedURL, this.assetFile, blobConfig).subscribe(() => {
            const fileURL = signedURL.split('?')[0];
              let fileType;
              if (this.assetFile!==undefined) {
                fileType = this.assetFile.type;
              } else {
                fileType = this.fileType;
              }
              this.updateContentWithURL(fileURL, fileType, contentId, modal);
          })
        })
      })
    }
  }
  
  updateContentWithURL(fileURL, mimeType, contentId, modal?) {
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
    this.questionService.uploadMedia(option, contentId).pipe(catchError(err => {
      const errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.027') };
      this.isClosable = true;
      this.loading = false;
      this.assetFormValid = true;
      return throwError(this.editorService.apiErrorHandling(err, errInfo));
    })).subscribe(res => {
      // Read upload asset data
      this.getUploadAsset(res.result.node_id, modal);
    });
  }
  
  getUploadAsset(assetId, modal?) {
    this.questionService.getVideo(assetId).pipe(map((data: any) => data.result.content), catchError(err => {
      const errInfo = { errorMsg: _.get(this.configService, 'labelConfig.messages.error.011') };
      this.loading = false;
      this.isClosable = true;
      this.assetFormValid = true;
      return throwError(this.editorService.apiErrorHandling(err, errInfo));
    })).subscribe(res => {
      this.selectedAsset = res;
      this.showAddButton = true;
      this.loading = false;
      this.isClosable = true;
      this.assetFormValid = true;
      this.addAssetInEditor(modal, res);
    });
  }
  
  uploadToBlob(signedURL, file, config): Observable<any> {
    const csp = _.get(this.editorService.editorConfig, 'context.cloudStorage.provider', 'azure');
    return this.questionService.uploadToBlob(signedURL, file, csp).pipe(catchError(err => {
      const errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.018') };
      this.isClosable = true;
      this.loading = false;
      this.assetFormValid = true;
      return throwError(this.editorService.apiErrorHandling(err, errInfo));
    }), map(data => data));
  }

  ngOnDestroy() {
    if (this.modal?.deny) {
      this.modal.deny();
    }
  }
}