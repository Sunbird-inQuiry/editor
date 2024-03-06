import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'lib-asset-segment',
  templateUrl: './asset-segment.component.html',
  styleUrls: ['./asset-segment.component.scss']
})
export class AssetSegmentComponent {
  @Input() assets: any;
  @Input() assetType: string;
  @Output() assetSelectOutput = new EventEmitter<any>();
  addAsset(event) {
    this.assetSelectOutput.emit(event);
  }
}
