import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AppLoaderComponent } from './app-loader.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfigService } from '../../services/config/config.service';



describe('AppLoaderComponent', () => {
  let component: AppLoaderComponent;
  let fixture: ComponentFixture<AppLoaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ AppLoaderComponent ],
      providers: [ConfigService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppLoaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set the loader message', () => {
    component.data = {headerMessage: 'Please wait..', loaderMessage: 'We are fetching the details..'}
    spyOn(component, 'ngOnInit').and.callThrough();
    component.headerMessage = '';
    component.loaderMessage = '';
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(component.headerMessage).toEqual(component.data.headerMessage);
    expect(component.loaderMessage).toEqual(component.data.loaderMessage);
  });

  it('ngOnInit should not set the loader message', () => {
    component.data = undefined;
    spyOn(component, 'ngOnInit').and.callThrough();
    component.headerMessage = '';
    component.loaderMessage = '';
    component.ngOnInit();
    expect(component.ngOnInit).toHaveBeenCalled();
    expect(component.headerMessage).toEqual('');
    expect(component.loaderMessage).toEqual('');
  });

});
