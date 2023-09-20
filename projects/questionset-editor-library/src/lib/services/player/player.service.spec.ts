import { TestBed } from '@angular/core/testing';
import { PlayerService } from './player.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { EditorService } from './../../services/editor/editor.service';
import { ConfigService } from '../../services/config/config.service';
import * as urlConfig from '../../services/config/url.config.json';
import * as labelConfig from '../../services/config/label.config.json';
import * as categoryConfig from '../../services/config/category.config.json';
import * as playerConfig from '../../services/config/player.config.json';
const configStub = {
  urlConFig: (urlConfig as any).default,
  labelConfig: (labelConfig as any).default,
  categoryConfig: (categoryConfig as any).default,
  playerConfig: (playerConfig as any).default,
};

const mockEditorService = {
  editorConfig: {
    context: {
      sid: '123',
      uid: '1234',
      timeDiff: '',
      contextRollup: '',
      channel: 'sunbird',
      did: '123',
      mode: '',
      metadata: {},
      data: {},
      user: {
        firstName: 'Amol',
        lastName: 'G'
      }
    },
    config: {
    }
  }
};

describe('PlayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
      providers: [HttpClient,
        { provide: EditorService, useValue: mockEditorService },
        { provide: ConfigService, useValue: configStub }]
    });
  });

  it('should be created', () => {
    const service: PlayerService = TestBed.inject(PlayerService);
    expect(service).toBeTruthy();
  });

  it('#getQumlPlayerConfig() should return QUML player config', () => {
    const service: PlayerService = TestBed.inject(PlayerService);
    const result = service.getQumlPlayerConfig();
    expect(result.context.userData).toBeTruthy();
    expect(result.config).toBeTruthy();
    expect(result.context.mode).toEqual('play');
    expect(result.metadata).toBeTruthy();
    expect(result.data).toBeTruthy();
  })
});
