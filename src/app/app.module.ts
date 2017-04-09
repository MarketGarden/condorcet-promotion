import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { DndModule } from 'ng2-dnd';
import { AppComponent } from './app.component';
import { SimulationComponent } from './simulation/simulation.component';
import { ElastischInputDirective } from './elastisch-input.directive';

@NgModule({
  declarations: [
    AppComponent,
    SimulationComponent,
    ElastischInputDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    DndModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }