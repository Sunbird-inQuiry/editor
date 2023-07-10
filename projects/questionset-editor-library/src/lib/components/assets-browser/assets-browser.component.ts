import { Component, OnInit, AfterViewInit, Output, Input, EventEmitter, OnChanges, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import * as _ from 'lodash-es';
import { catchError, map } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { EditorService } from '../../services/editor/editor.service';
import { ConfigService } from '../../services/config/config.service';
import { QuestionService } from '../../services/question/question.service';
import { config } from 'projects/questionset-editor-library/src/lib/components/asset-browser/asset-browser.data';
import { ToasterService } from '../../services/toaster/toaster.service';

@Component({
  selector: 'lib-assets-browser',
  templateUrl: './assets-browser.component.html',
  styleUrls: ['./assets-browser.component.scss']
})
export class AssetsBrowserComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('editor') public editorRef: ElementRef;
  @Output() videoDataOutput = new EventEmitter<any>();
  @Output() editorDataOutput = new EventEmitter<any>();
  @Input() editorDataInput: any;
  @Input() videoShow;
  @Input() assetType;
  @Input() showAssetPicker;
  @Output() assetBrowserEmitter = new EventEmitter<any>();
  @Output() modalDismissEmitter = new EventEmitter<any>();
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
    this.editorConfig = {
      toolbar: ['heading', '|', 'bold', '|', 'italic', '|', 'underline', '|', 'BulletedList', '|', 'alignment',
        '|', 'insertTable', '|', 'numberedList', '|', 'fontSize', '|', 'subscript', '|', 'superscript', '|',
        'MathText', '|', 'specialCharacters', '|'
      ],
      fontSize: {
        options: [
          'eight',
          'ten',
          'twelve',
          'fourteen',
          'sixteen',
          'eighteen',
          'twenty',
          'twentytwo',
          'twentyfour',
          'twentysix',
          'twentyeight',
          'thirty',
          'thirtysix'
        ]
      },
      image: {
        resizeUnit: '%',
        resizeOptions: [{
          name: 'resizeImage:25',
          value: '25',
          icon: 'small',
          className: 'resize-25'
        },
        {
          name: 'resizeImage:50',
          value: '50',
          icon: 'medium',
          className: 'resize-50'
        },
        {
          name: 'resizeImage:75',
          value: '75',
          icon: 'large',
          className: 'resize-75'
        },
        {
          name: 'resizeImage:100',
          value: '100',
          icon: 'full',
          className: 'resize-100'
        },
        {
          name: 'resizeImage:original',
          value: null,
          icon: 'original',
          className: 'resize-original'
        }],
        toolbar: ['imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight', '|',
        'resizeImage:25', 'resizeImage:50', 'resizeImage:75',  'resizeImage:100', 'resizeImage:original'],
        styles: ['full', 'alignLeft', 'alignRight', 'alignCenter']
      },
      isReadOnly: false,
      removePlugins: ['ImageCaption', 'mathtype', 'ChemType', 'ImageResizeHandles']
    };
  }

  ngOnChanges() {
    if (this.videoShow) {
      this.showAssetPicker = true;
      this.selectAsset(undefined);
    }
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
    if(this.assetType=='video') {
      this.videoShow=false;
      this.videoDataOutput.emit(false);
    } else if(this.assetType == 'image') {
      this.showAssetPicker = false;
      this.modalDismissEmitter.emit({});
    }
  }
  
  selectAsset(data) {
    if (data) {
      this.showAddButton = true;
      this.selectedAssetId = data.identifier;
      this.selectedAsset = data;
    } else {
      this.showAddButton = false;
      this.selectedAssetId = '';
      this.selectedAsset = {};
    }
  }
  
  getMyAssets(offset, query?, search?) {
  this.assetsCount = 0;
  if (!search) {
    this.searchMyInput = '';
    if(this.assetType == 'video') {
      this.selectAsset(undefined);
    }
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
    if (this.assetType == 'image') {
      errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.022') };
    } else if (this.assetType == 'video') {
      errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.023')};
    }
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
      if (this.assetType == 'image') {
         errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.022') };
      } else if (this.assetType == 'video') {
        errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.023') };
      }
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
  
  addAssetInEditor(videoModal?, assetUrl?, assetId?, assetName?) {
    if (this.assetType == 'image'){
      const src = this.getMediaOriginURL(assetUrl);
      const baseUrl = _.get(this.editorService.editorConfig, 'context.host') || document.location.origin;
      this.mediaobj = {
        id: assetId,
        type: 'image',
        src,
        baseUrl
      };
      this.editorInstance.model.change(writer => {
        const imageElement = writer.createElement('image', {
          src,
          alt: assetName,
          'data-asset-variable': assetId
        });
        this.editorInstance.model.insertContent(imageElement, this.editorInstance.model.document.selection);
      });
      this.showAssetPicker = false;
      this.showAssetUploadModal = false;
    } else if (this.assetType == 'video') {
        const videoData: any = _.cloneDeep(this.selectedAsset);
        videoData.src = this.getMediaOriginURL(videoData.downloadUrl);
        videoData.thumbnail = (videoData.thumbnail) && this.getMediaOriginURL(videoData.thumbnail);
        this.showAssetPicker = false;
        this.videoDataOutput.emit(videoData);
        if (videoModal) {
          videoModal.deny();
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
  
  public isEditorReadOnly(state) {
    this.editorInstance.isReadOnly = state;
    this.isAssetBrowserReadOnly = state;
  }
  
  uploadAsset(event) {
    const file = event.target.files[0];
    this.assetName = file.name;
    const reader = new FileReader();
    this.formData = new FormData();
    this.formData.append('file', file);
    const fileType = file.type;
    const fileName = file.name.split('.').slice(0, -1).join('.');
    const fileSize = file.size / 1024 / 1024;
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
        reader.readAsDataURL(file);
      }
    } else {
      this.showErrorMsg = true;
      this.errorMsg = _.get(this.configService.labelConfig?.chooseFileMsg[this.assetType]);
    } if (!this.showErrorMsg) {
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
        if(this.assetType === 'video') {
           errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.025') };
        } else if(this.assetType === 'image') {
          errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.019') };
        }
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
            if (this.assetType === 'video') {
              this.updateContentWithURL(fileURL, this.assetFile.type, contentId, modal);
            } else if (this.assetType ==='image') {
              const data = new FormData();
              data.append('fileUrl', fileURL);
              data.append('mimeType', _.get(this.assetFile, 'type'));
              const config1 = {
                enctype: 'multipart/form-data',
                processData: false,
                contentType: false,
                cache: false
              };
              const uploadMediaConfig = {
                data,
                param: config1
              };
              this.questionService.uploadMedia(uploadMediaConfig, contentId).pipe(catchError(err => {
                const errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.019') };
                this.isClosable = true;
                this.loading = false;
                this.assetFormValid = true;
                return throwError(this.editorService.apiErrorHandling(err, errInfo));              
              })).subscribe((res) => {
                this.addAssetInEditor(res.result.content_url, res.result.node_id);
                this.showAssetUploadModal = false;
                this.dismissPops(modal);
              })   
            }
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
      param: config
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
      this.toasterService.success(_.get(this.configService, 'labelConfig.messages.success.006'));
      this.selectedAsset = res;
      this.showAddButton = true;
      this.loading = false;
      this.isClosable = true;
      this.assetFormValid = true;
      this.addAssetInEditor(modal);
    });
  }
  
  uploadToBlob(signedURL, file, config): Observable<any> {
    return this.questionService.http.put(signedURL, file, config).pipe(catchError(err => {
      const errInfo = { errorMsg: _.get(this.configService.labelConfig, 'messages.error.018') };
      this.isClosable = true;
      this.loading = false;
      this.assetFormValid = true;
      return throwError(this.editorService.apiErrorHandling(err, errInfo));
    }), map(data => data));
  }

  ngOnDestroy() {
    if (this.modal && this.modal.deny) {
      this.modal.deny();
    }
  }
}