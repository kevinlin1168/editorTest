import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { NgModule } from '@angular/core';
// import { MatTableModule } from '@angular/material/table';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorContainerComponent } from './components/editor/editor-container/editor-container.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableToolbarComponent } from './components/editor/table-toolbar/table-toolbar.component';
import { ImageToolbarComponent } from './components/editor/image-toolbar/image-toolbar.component';

@NgModule({
  declarations: [
    AppComponent,
    EditorContainerComponent,
    TableToolbarComponent,
    ImageToolbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    // MatTableModule,
    AppRoutingModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
