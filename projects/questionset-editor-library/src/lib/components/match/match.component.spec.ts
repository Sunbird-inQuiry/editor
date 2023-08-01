import { TelemetryInteractDirective } from '../../directives/telemetry-interact/telemetry-interact.directive';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { MatchComponent } from './match.component';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { ConfigService } from '../../services/config/config.service';
import { SuiModule } from 'ng2-semantic-ui-v9';
import { TreeService } from '../../services/tree/tree.service';
import { EditorTelemetryService } from '../../services/telemetry/telemetry.service';


describe('OptionsComponent', () => {
  let component: MatchComponent;
  let fixture: ComponentFixture<MatchComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, SuiModule],
      declarations: [MatchComponent, TelemetryInteractDirective],
      providers: [ConfigService, TreeService, EditorTelemetryService,],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});