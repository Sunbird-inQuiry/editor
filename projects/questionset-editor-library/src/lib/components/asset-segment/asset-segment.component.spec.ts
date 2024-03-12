import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetSegmentComponent } from './asset-segment.component';

describe('AssetSegmentComponent', () => {
  let component: AssetSegmentComponent;
  let fixture: ComponentFixture<AssetSegmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetSegmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetSegmentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('addAsset should emit assetSelectOutput', () => {
    spyOn(component.assetSelectOutput, 'emit').and.callFake(() => {});
    spyOn(component, 'addAsset').and.callThrough();
    component.addAsset({});
    expect(component.assetSelectOutput.emit).toHaveBeenCalled();
  })  
});
