import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { map, takeUntil, concatAll, finalize, tap} from 'rxjs/operators';
import { style } from '@angular/animations';

export interface MouseEvent {
  rowId:     number;
  colId:     number;
}

export interface SelectObj {
  startCol: number;
  endCol:   number;
  startRow: number;
  endRow:   number;
}

//global this
let _this;

@Component({
  selector: 'app-editor-container',
  templateUrl: './editor-container.component.html',
  styleUrls: ['./editor-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EditorContainerComponent implements OnInit {
  private imageSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTAgMjUwIj4KICAgIDxwYXRoIGZpbGw9IiNERDAwMzEiIGQ9Ik0xMjUgMzBMMzEuOSA2My4ybDE0LjIgMTIzLjFMMTI1IDIzMGw3OC45LTQzLjcgMTQuMi0xMjMuMXoiIC8+CiAgICA8cGF0aCBmaWxsPSIjQzMwMDJGIiBkPSJNMTI1IDMwdjIyLjItLjFWMjMwbDc4LjktNDMuNyAxNC4yLTEyMy4xTDEyNSAzMHoiIC8+CiAgICA8cGF0aCAgZmlsbD0iI0ZGRkZGRiIgZD0iTTEyNSA1Mi4xTDY2LjggMTgyLjZoMjEuN2wxMS43LTI5LjJoNDkuNGwxMS43IDI5LjJIMTgzTDEyNSA1Mi4xem0xNyA4My4zaC0zNGwxNy00MC45IDE3IDQwLjl6IiAvPgogIDwvc3ZnPg=="
  public isShowEdit = false;
  private tagName = '';
  public clickElement;
  private table; // for test add cell
  private cellIndex;
  private rowIndex;
  private imgX;
  private imgY;
  private initImageWidth = 0.1;
  private imageWidth;
  private isMouseDown: boolean = false;
  private defaultHtml: string = '<div>文字</div>';
  private tableMouseDown: MouseEvent;
  private tableMouseUp: MouseEvent;
  private tableSeleted;
  constructor(public changeDetectorRef:ChangeDetectorRef) { }

  ngOnInit() {
    _this = this;
  }

  fontStyle(style: string) {
    if(style!= 'createLink' && style != 'insertImage' && style != 'insertVideo' && style != 'insertTable') {
      document.execCommand(style);
    } else if (style == 'createLink'){
      document.execCommand(style, false, 'https://developer.mozilla.org/zh-TW/docs/Web/API/Document/execCommand');
    } else if (style == 'insertImage') {
      var range = this.getRange();

      let fig = document.createElement('figure');
      fig.setAttribute("id", "myFigure");

      let img = document.createElement("img");
  
      // set img element
      img.setAttribute("src", this.imageSrc);
      img.setAttribute("alt", "The Pulpit Rock");
      img.setAttribute("class", "item-hover");
      img.setAttribute("draggable", 'false');
      img.setAttribute("style", "float: left;")
      // set fig element
      fig.setAttribute("style", `width: ${this.initImageWidth * 100}%;`);
      fig.setAttribute("class", "figure-color image-style-side");
      // fig.setAttribute("contenteditable", "false");

      var tool = document.createElement("div");
      fig.appendChild(img);

      // TODO modify css
      let borderDiv = document.createElement('div');
      let topLeftPort = document.createElement('div');
      let topRightPort = document.createElement('div');
      let bottomRightPort = document.createElement('div');
      let bottomLeftPort = document.createElement('div');
      borderDiv.append(topLeftPort, topRightPort, bottomLeftPort, bottomRightPort);
      fig.appendChild(borderDiv);

      // delete whatever is on the range
      range.deleteContents();
      // place your span
      range.insertNode(fig);

      let editor = document.getElementById('editor');

      const mouseUp = fromEvent(editor, 'mouseup');
      const mouseMove = fromEvent(editor, 'mousemove');

      let mouseDown = fromEvent(fig, 'mousedown')
        .pipe(
          map(event => mouseMove.pipe(
                                  takeUntil(mouseUp),
                                  finalize(() => {
                                    this.imgX = null;
                                    this.imgY = null;
                                    this.imageWidth = this.imgWidthToPoint(fig.getAttribute('style'));
                                  })
                                )),
          concatAll(),
          map(event => ({ x: event['clientX'], y: event['clientY'] }))
        )
        .subscribe(pos => {
          if(this.imgX && this.imgY) {
            fig.setAttribute('style', `width: ${((this.imageWidth + (this.imgX - pos.x) / this.imgX)) * 100}%;`)
          } else {
            this.imageWidth = this.imgWidthToPoint(fig.getAttribute('style'));
            this.imgX = pos.x;
            this.imgY = pos.y;
          }
        })
    } else if (style == 'insertTable'){
      // try to add table
      var range = this.getRange();
      let table = document.createElement('table');
      table.setAttribute('class', 'item-hover neux-table');
      table.addEventListener("mousedown", this.onMouseDown);
      // table.addEventListener("mousemove", this.onMouseMove);
      table.addEventListener("mouseup", this.onMouseUp);
      // table.setAttribute('class', 'tg');
      let row = table.insertRow(0); 
      let cell = row.insertCell(0);
      this.initCell(cell)
      cell = row.insertCell(1);
      this.initCell(cell);
      row = table.insertRow(1); 
      cell = row.insertCell(0);
      this.initCell(cell);
      cell = row.insertCell(1);
      this.initCell(cell);

      range.insertNode(table)

      this.resizableGrid(table);
    } else {
      document.execCommand('insertHTML', false, '<iframe width="560" height="315" src="https://www.youtube.com/embed/FMl7GEaYwAE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>')
    }
    
  }

  onMouseDown(event) {
    let tempEvent = _this.getMouseEvent(event.target)
    if (tempEvent != undefined) {
      this.isMouseDown = true;
      this.tableMouseDown = tempEvent;
    }
    _this.resetSeleted();
  }

  resizableGrid(table) {
    var row = table.getElementsByTagName('tr')[0],
    cols = row ? row.children : undefined;
    if (!cols) return;

    for (var i=0;i<cols.length;i++){
      let isExist = false;
      // TODO
      for (let j = 0; j < cols[i].children.length; j++) {
        if(cols[i].children[j].id == 'resize') {
          isExist = true;
        }
      }
      if (isExist) {
        continue;
      } else {
        var div = this.createDiv(cols[i].offsetHeight);
        cols[i].appendChild(div);
        cols[i].style.position = 'relative';
        _this.setListeners(div);
      }
    }
  }

  setListeners(div){
    let pageX,curCol,nxtCol,curColWidth,nxtColWidth;
    let editor = document.getElementById('editor');

    const mouseUp = fromEvent(editor, 'mouseup');
    const mouseMove = fromEvent(editor, 'mousemove');

    let mouseDown = fromEvent(div, 'mousedown')
      .pipe(
        tap(e => {
          // init 
          curCol = e['target'].parentElement;
          nxtCol = curCol.nextElementSibling;
          pageX = e['pageX'];
          curColWidth = curCol.offsetWidth
          if (nxtCol) {
            nxtColWidth = nxtCol.offsetWidth
          }
        }),
        map(event => mouseMove.pipe(
                                takeUntil(mouseUp),
                                finalize(() => {
                                  curCol = undefined;
                                  nxtCol = undefined;
                                  pageX = undefined;
                                  nxtColWidth = undefined;
                                  curColWidth = undefined;
                                }))
        ),
        concatAll()
      )
      .subscribe((e) => {
        if (curCol) {
          var diffX = e['pageX'] - pageX;
        
          if (nxtCol) {
            nxtCol.style.width = (nxtColWidth - (diffX))+'px';
          }
        
          curCol.style.width = (curColWidth + diffX)+'px';
        }
      })
    // div.addEventListener('mousedown', function (e) {
    //   curCol = e.target.parentElement;
    //   nxtCol = curCol.nextElementSibling;
    //   pageX = e.pageX;
    //   curColWidth = curCol.offsetWidth
    //   if (nxtCol)
    //   nxtColWidth = nxtCol.offsetWidth
    // });
   
    // document.addEventListener('mousemove', function (e) {
    //   if (curCol) {
    //   var diffX = e.pageX - pageX;
    
    //   if (nxtCol)
    //     nxtCol.style.width = (nxtColWidth - (diffX))+'px';
    
    //   curCol.style.width = (curColWidth + diffX)+'px';
    //   }
    // });
   
    // document.addEventListener('mouseup', function (e) { 
    //   curCol = undefined;
    //   nxtCol = undefined;
    //   pageX = undefined;
    //   nxtColWidth = undefined;
    //   curColWidth = undefined;
    // });
   }

  resetSeleted() {
    if(_this.table) {
      //TODO
      for(let i = 0; i < _this.table.rows.length; i++) {
        for(let j = 0; j < _this.table.rows[i].cells.length; j++) {
          let cell = _this.table.rows[i].cells[j];
          cell.setAttribute('class', cell.getAttribute('class').replace(' seleted', ''))
        }
      }
    }
  }

  onMouseUp(event) {
    if (this.isMouseDown) {
      this.isMouseDown = false;
      let tempEvent = _this.getMouseEvent(event.target)
      if (tempEvent != undefined) {
        this.tableMouseUp =  tempEvent;
        _this.tableSeleted = _this.getSeleteCell(this.tableMouseDown, this.tableMouseUp);
        for (let i = _this.tableSeleted.startRow; i <= _this.tableSeleted.endRow; i++) {
          for (let j = _this.tableSeleted.startCol; j <= _this.tableSeleted.endCol; j++) {
            let cell = _this.table.rows[i].cells[j];
            cell.setAttribute('class', cell.getAttribute('class') + ' seleted');
          }
        }
      }
    }
  }

  getMouseEvent(element):MouseEvent {
    let colIndex = undefined;
    let rowIndex = undefined; 
    while(element) {
      let tagName = element.tagName.toLowerCase();
      if (tagName == 'td') {
        colIndex = element.cellIndex;
        element = element.parentNode;
      } else if (tagName == 'tr') {
        rowIndex = element.rowIndex;
        element = element.parentNode;         
      } else if (tagName == 'table') {
        this.table = element;
        break;
      } else if (tagName == 'html'){
        break;
      } else {
        element = element.parentNode;
      }
    }
    if (colIndex != undefined && rowIndex != undefined) {
      return {colId: colIndex, rowId: rowIndex};
    } else {
      return undefined;
    }
  }

  getSeleteCell(tableMouseDown, tableMouseUp) {
    let startCol: number;
    let endCol:   number;
    let startRow: number;
    let endRow:   number;
    if(tableMouseDown && tableMouseUp) {
      let mouseDownSpan = this.getSpans(tableMouseDown.rowId, tableMouseDown.colId);
      let mouseUpSpan = this.getSpans(tableMouseDown.rowId, tableMouseDown.colId);

      if(tableMouseDown.colId <= tableMouseUp.colId) {
        startCol = tableMouseDown.colId;
      } else {
        startCol   = tableMouseUp.colId;
      }
      if(tableMouseDown.colId + mouseDownSpan.colSpan <= tableMouseUp.colId + mouseUpSpan.colSpan) {
        endCol = tableMouseUp.colId + mouseUpSpan.colSpan - 1
      } else {
        endCol = tableMouseDown.colId + mouseDownSpan.colSpan - 1
      }
  
      if(tableMouseDown.rowId <= tableMouseUp.rowId) {
        startRow = tableMouseDown.rowId;
      } else {
        startRow = tableMouseUp.rowId;
      }
      if(tableMouseDown.rowId + mouseDownSpan.rowSpan <= tableMouseUp.rowId + mouseUpSpan.rowSpan) {
        endRow = tableMouseUp.rowId + mouseUpSpan.rowSpan - 1
      } else {
        endRow = tableMouseDown.rowId + mouseDownSpan.rowSpan - 1
      }

      let maxCol: number = endCol;
      // let minCol: number = startCol;
      let maxRow: number = endRow;
      // let minRow: number = startRow;

      //TODO
      for (let i=startRow; i<= endRow; i++) {
        for (let j=startCol; j<= endCol; j++) {
          if( maxCol < (j + this.getSpans(i, j).colSpan)) {
            maxCol = (j + this.getSpans(i, j).colSpan) - 1;
          }
          if( maxRow < (i + this.getSpans(i, j).rowSpan)) {
            maxRow = (i + this.getSpans(i, j).rowSpan) - 1;
          }
        }
      }

      return {
        startCol: startCol,
        endCol: maxCol,
        startRow: startRow,
        endRow: maxRow
      }
    } else {
      return undefined;
    } 
  }

  getSpans(rowId, colId) {
    let cell = this.table.rows[rowId].cells[colId];
    let rowSpan;
    let colSpan;
    if(cell != undefined) {
      rowSpan = cell.getAttribute('rowspan');
      colSpan = cell.getAttribute('colspan');
    }
    if(rowSpan == null) {
      rowSpan = 1;
    } else {
      rowSpan = Number(rowSpan);
    }
    if(colSpan == null) {
      colSpan = 1;
    } else {
      colSpan = Number(colSpan);
    }
    return {rowSpan: rowSpan, colSpan: colSpan}
  }

  getRange() {
    return window.getSelection().getRangeAt(0); 
  }

  onClick(event) {
    let element = event.target;
    while(element) {
      let tagName = element.tagName.toLowerCase();
      if(tagName == 'figure') {
        console.log('figure');
        this.clickElement = element;
        // element.setAttribute('style', 'width:100%');
        let tool = document.getElementById('tool');
        // for display block
        tool.setAttribute('style', `display:block;`);
        // for set position
        tool.setAttribute('style', `left:${element.offsetLeft + (element.offsetWidth / 2) - (tool.offsetWidth / 2)}px; top:${element.offsetTop - (tool.offsetHeight)}px; display:block;`);
        this.isShowEdit = true;
        break;
      } else if (tagName == 'td') {
        this.cellIndex = element.cellIndex;
        element = element.parentNode;
      } else if (tagName == 'tr') {
        this.rowIndex = element.rowIndex;
        element = element.parentNode;
      } else if (tagName == 'table') {
        // document.getElementById('tool').setAttribute('style', `left:${element.offsetLeft}px; top:${element.offsetTop}px; display:block;`);
        this.table = element;
        break;
      } else if (tagName == 'html'){
        document.getElementById('tool').setAttribute('style', `display:none;`)
        break;
      } else {
        element = element.parentNode;
      }
    }
  }

  addRowAbove() {
    this.addRow(this.tableSeleted.startRow);
  }

  addRowBelow() {
    this.addRow(this.tableSeleted.startRow + 1);
  }

  addRow(index) {
    // let row = this.table.insertRow(0);
    let cells = this.table.rows[this.rowIndex].cells;
    let row = this.table.insertRow(index);
    for(let i = 0; i < cells.length; i++) {
      let cell = row.insertCell(i);
      this.initCell(cell);
    }
    this.resizableGrid(this.table);
  }


  initCell(cell) {
    cell.setAttribute('class', 'tg-0pky');
    cell.setAttribute('colspan', '1');
    cell.setAttribute('rowspan', '1');
    cell.innerHTML = this.defaultHtml;
  }

  deleteRow() {
    for(let i = this.tableSeleted.startRow; i <= this.tableSeleted.endRow; i++) {
      this.table.deleteRow(this.tableSeleted.startRow);
    }
    this.resizableGrid(this.table);
  }

  deleteCol() {
    for (let i = 0; i < this.table.rows.length; i++) {
      for (let j = this.tableSeleted.startCol; j <= this.tableSeleted.endCol; j++) {
        this.table.rows[i].deleteCell(this.tableSeleted.startCol);
      }
    }
    this.resizableGrid(this.table);
  }

  createDiv(tableHeight){
    let div = document.createElement('div');
    div.contentEditable = 'false';
    div.id = 'resize';
    div.style.top = '0';
    div.style.right = '0';
    div.style.width = '5px';
    div.style.position = 'absolute';
    div.style.cursor = 'col-resize';
    /* remove backGroundColor later */
    // div.style.backgroundColor = 'red';
    div.style.userSelect = 'none';
    /* table height */
    div.style.height = tableHeight+'px';
    return div;
   }

  addColLeftward() {
    this.addCol(this.tableSeleted.startCol, this.tableSeleted.startRow);
  }

  addColRightward() {
    this.addCol(this.tableSeleted.startCol + 1, this.tableSeleted.startRow);
  }

  addCol(colIndex, rowIndex) {
    console.log('colIndex', colIndex, 'rowIndex', rowIndex)
    for (var i = 0; i < this.table.rows.length; i++) {
      let cell = this.table.rows[i].insertCell(colIndex);
      cell.setAttribute('class', 'tg-0pky');
      cell.setAttribute('colspan', '1');
      cell.setAttribute('rowspan', '1');
      cell.innerHTML = '<div>文字</div>';
    }
    this.resizableGrid(this.table);
  }

  mergeTable() {
    if(this.tableSeleted) {
      if(this.tableSeleted.startRow === this.tableSeleted.endRow) {
        this.mergeCol(this.tableSeleted.startCol, this.tableSeleted.endCol, this.tableSeleted.startRow);
      } else if(this.tableSeleted.startCol === this.tableSeleted.endCol) {
        this.mergeRow(this.tableSeleted.startRow, this.tableSeleted.endRow, this.tableSeleted.startCol);
      } else {
        for(let i = this.tableSeleted.startRow; i <= this.tableSeleted.endRow; i++) {
          this.mergeCol(this.tableSeleted.startCol, this.tableSeleted.endCol, i);
        }
        for(let i = this.tableSeleted.startCol; i <= this.tableSeleted.endCol; i++) {
          this.mergeRow(this.tableSeleted.startRow, this.tableSeleted.endRow, i);
        }
      }
    }
  }

  mergeRow(startRow: number, endRow: number, col: number){
    let rowSpan = Number(this.table.rows[startRow].cells[col].getAttribute('rowspan'));
    for(let index = startRow + 1 ; index <= endRow ; index++) {
      let cell = this.table.rows[index].cells[col];
      rowSpan += Number(cell.getAttribute('rowspan'));
      cell.setAttribute('rowspan', '0');
      cell.setAttribute('colspan', '0');
      cell.setAttribute('style', 'display:none;')
    }
    this.table.rows[startRow].cells[col].setAttribute('rowspan', rowSpan.toString());
  }

  mergeCol(startCol: number, endCol: number, row: number){
    let colSpan = Number(this.table.rows[row].cells[startCol].getAttribute('colspan'));
    for(let index = startCol + 1; index <= endCol ; index++) {
      let cell = this.table.rows[row].cells[index];
      colSpan += Number(cell.getAttribute('colspan'));
      cell.setAttribute('rowspan', '0');
      cell.setAttribute('colspan', '0');
      cell.setAttribute('style', 'display:none;')
    }
    this.table.rows[row].cells[startCol].setAttribute('colspan', colSpan.toString());
  }

  unmerge() {
    if(this.table) {
      for(let i = this.tableSeleted.startRow; i <= this.tableSeleted.endRow; i++) {
        for(let j = this.tableSeleted.startCol; j <= this.tableSeleted.endCol; j++) {
          let cell = this.table.rows[i].cells[j];
          cell.setAttribute('style', 'position: relative;')
          cell.setAttribute('rowspan', '1');
          cell.setAttribute('colspan', '1');
        }
      }
    }
  }

  imgWidthToPoint(width){
    let temp = width.replace("width: ", "")
    let str=temp.replace("%;","");
    str = str/100;
    return str;
  }
}
