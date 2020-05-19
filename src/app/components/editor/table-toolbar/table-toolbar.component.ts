import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-toolbar',
  templateUrl: './table-toolbar.component.html',
  styleUrls: ['./table-toolbar.component.scss']
})
export class TableToolbarComponent implements OnInit {
  @Output() addRowAbove: EventEmitter<any> = new EventEmitter();
  @Output() addRowBelow: EventEmitter<any> = new EventEmitter();
  @Output() addColLeftward: EventEmitter<any> = new EventEmitter();
  @Output() addColRightward: EventEmitter<any> = new EventEmitter();
  @Output() mergeTable: EventEmitter<any> = new EventEmitter();
  @Output() unmerge: EventEmitter<any> = new EventEmitter();
  @Output() deleteRow: EventEmitter<any> = new EventEmitter();
  @Output() deleteCol: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  addRowAboveEvent() {
    this.addRowAbove.emit(null)
  }

  addRowBelowEvent() {
    this.addRowBelow.emit(null);
  }

  addColLeftwardEvent() {
    this.addColLeftward.emit(null);
  }

  addColRightwardEvent() {
    this.addColRightward.emit(null);
  }

  mergeTableEvent() {
    this.mergeTable.emit(null);
  }

  unmergeEvent() {
    this.unmerge.emit(null);
  }

  deleteRowEvent() {
    this.deleteRow.emit(null);
  }

  deleteColEvent() {
    this.deleteCol.emit(null);
  }
}
