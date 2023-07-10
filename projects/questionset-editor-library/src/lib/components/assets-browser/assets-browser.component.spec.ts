import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetsBrowserComponent } from './assets-browser.component';

describe('AssetsBrowserComponent', () => {
  let component: AssetsBrowserComponent;
  let fixture: ComponentFixture<AssetsBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetsBrowserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
