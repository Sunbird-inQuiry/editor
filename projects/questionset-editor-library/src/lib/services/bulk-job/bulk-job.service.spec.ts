import { TestBed } from '@angular/core/testing';
import { BulkJobService } from './bulk-job.service';
import { ConfigService } from '../config/config.service';
import * as urlConfig from '../config/url.config.json';
import * as labelConfig from '../config/label.config.json';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { PublicDataService } from '../public-data/public-data.service';
import { of, throwError } from 'rxjs';
import * as _ from 'lodash-es';
xdescribe('BulkJobService', () => {
  const configStub = {
    urlConFig: (urlConfig as any).default,
    labelConfig: (labelConfig as any).default
  };
  const serverResponse = {
    id: '',
      params: {
        resmsgid: '',
        msgid: '',
        err: '',
        status: '',
        errmsg: ''
      },
      responseCode: '200',
      result: {
      },
      ts: '',
      ver: '',
      headers: {}
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HttpClient, PublicDataService, { provide: ConfigService, useValue: configStub }]
    });
  });

  it('should be created', () => {
    const service: BulkJobService = TestBed.inject(BulkJobService);
    expect(service).toBeTruthy();
  });
  it('#getBulkOperationStatus() should get bulk operation status', () => {
    const publicDataService: PublicDataService = TestBed.inject(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of(serverResponse));
    const service: BulkJobService = TestBed.inject(BulkJobService);
    const observable = service.getBulkOperationStatus('do_123');
    observable.subscribe((data) => {
      expect(data).toEqual({});
    });
  });
  it('#createBulkJob() should get bulk operation status', () => {
    const publicDataService: PublicDataService = TestBed.inject(PublicDataService);
    spyOn(publicDataService, 'post').and.returnValue(of(serverResponse));
    const service: BulkJobService = TestBed.inject(BulkJobService);
    const observable = service.createBulkJob('do_123');
    observable.subscribe((data) => {
      expect(data).toEqual({});
    });
  });
});
