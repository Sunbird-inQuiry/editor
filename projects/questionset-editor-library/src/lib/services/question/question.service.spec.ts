import { TestBed } from "@angular/core/testing"
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { QuestionService } from './question.service';
import { ConfigService } from '../config/config.service';
import * as urlConfig from '../../services/config/url.config.json';
import * as labelConfig from '../../services/config/label.config.json';
import * as categoryConfig from '../../services/config/category.config.json';
import { of } from 'rxjs';
import { PublicDataService } from '../public-data/public-data.service';
import { EditorService } from '../../services/editor/editor.service';
import { editorConfig } from './../../components/editor/editor.component.spec.data';
import { mockRes } from "./question.service.spec.data";
declare const SunbirdFileUploadLib: any;

describe('QuestionService', () => {
    let questionService: QuestionService;
    let publicDataService: PublicDataService;

    const configStub = {
        urlConFig: (urlConfig as any).default,
        labelConfig: (labelConfig as any).default,
        categoryConfig: (categoryConfig as any).default,
        editorConfig: {
            config: {
                objectType: 'QuestionSet'
            }
        }
    };
    const editorConfigStub = { 'editorConfig': editorConfig };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [QuestionService, HttpClient,
                { provide: ConfigService, useValue: configStub },
                { provide: EditorService, useValue: editorConfigStub }
            ]
        });
        questionService = TestBed.inject(QuestionService);
        publicDataService = TestBed.inject(PublicDataService);
    });

    it('should be created', () => {
        expect(questionService).toBeTruthy();
    });

    it('#readQuestion() it should read the question on API success', () => {
        const questionId = 'do_123';
        spyOn(publicDataService, 'get').and.returnValue(of(mockRes.serverResponse));
        questionService.readQuestion(questionId).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#updateQuestionHierarchy() it should update hierarchy on question create and update', () => {
        const hierarchyBody = {};
        spyOn(publicDataService, 'patch').and.returnValue(of(mockRes.serverResponse));
        questionService.updateQuestionHierarchy(hierarchyBody).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#getAssetMedia() it should return assets on API success', () => {
        spyOn(publicDataService, 'post').and.returnValue(of(mockRes.serverResponse));
        questionService.getAssetMedia().subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#createMediaAsset() it should create asset on API success', () => {
        spyOn(publicDataService, 'post').and.returnValue(of(mockRes.serverResponse));
        questionService.createMediaAsset().subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#uploadMedia() it should upload asset on API success', () => {
        spyOn(publicDataService, 'post').and.returnValue(of(mockRes.serverResponse));
        const req = {};
        const assetId = 'do_123';
        questionService.uploadMedia(req, assetId).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#generatePreSignedUrl() it should generate pre signed url on API success', () => {
        spyOn(publicDataService, 'post').and.returnValue(of(mockRes.serverResponse));
        const req = {};
        const contentId = 'do_123';
        questionService.generatePreSignedUrl(req, contentId).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#getVideo() it should return video details on API success', () => {
        spyOn(publicDataService, 'get').and.returnValue(of(mockRes.serverResponse));
        const videoId = 'do_123';
        questionService.getVideo(videoId).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#upsertQuestion() it should update question on API success', () => {
        const questionId = 'do_123';
        spyOn(publicDataService, 'patch').and.returnValue(of(mockRes.serverResponse));
        questionService.upsertQuestion(questionId, {}).subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#getQuestionList() it should update question on API success', () => {
        const questionId = 'do_123';
        spyOn(publicDataService, 'post').and.returnValue(of(mockRes.serverResponse));
        questionService.getQuestionList(['do_123', 'do_1234'], 'editorState').subscribe(data => {
            expect(data.responseCode).toEqual('OK');
        });
    });

    it('#uploadToBlob should handle error during upload', (done) => {
        const mockSignedURL = 'mock-signed-url';
        const mockFile = new File(['mock content'], 'mock.png', { type: 'image/png' });
        const mockCSP = 'azure';
    
        spyOn(SunbirdFileUploadLib.FileUploader.prototype, 'upload')
          .and.returnValue({
            on: (eventName, callback) => {
              if (eventName === 'error') {
                callback('mock-error');
              }
              return this;
            },
          });
    
        questionService.uploadToBlob(mockSignedURL, mockFile, mockCSP).subscribe(
          (response) => {
            fail('Should not have succeeded');
            done();
          },
          (error) => {
            expect(error).toBe('mock-error');
            done();
          }
        );
      });

      it('should handle upload error', (done) => {
        const signedURL = 'mockSignedURL';
        const file = 'mockFile';
        const csp = 'mockCSP';
        const expectedError = 'Upload error';
    
        // Mock the FileUploader behavior
        spyOn(SunbirdFileUploadLib.FileUploader.prototype, 'upload').and.callFake(() => {
          return {
            on: (eventName, callback) => {
              if (eventName === 'completed') {
                callback('mock-completed-response');
              }
              return {
                on: (eventName, callback) => {
                  if (eventName === 'completed') {
                    callback('mock-completed-response');
                  }
                  return {
                    on: () => {},
                  };
                }
              }
            }
          }
        });
    
        questionService.uploadToBlob(signedURL, file, csp).subscribe(
          (response) => {
            expect(response).toBe('mock-completed-response');
            done();
          },
          (error) => {
            fail('Should not have encountered an error');
            done();
          }
        );
        
      });
});
