import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageToolbarComponent } from './image-toolbar.component';

describe('ImageToolbarComponent', () => {
  let component: ImageToolbarComponent;
  let fixture: ComponentFixture<ImageToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImageToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
