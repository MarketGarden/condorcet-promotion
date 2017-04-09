
import {AfterContentInit,AfterViewInit, AfterViewChecked, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appElastischInput]'
})
export class ElastischInputDirective implements AfterViewChecked{

constructor(private element: ElementRef) {
   
}

private resize() : void {
  let el= this.element.nativeElement;
  el.size =! el.value.length?1: el.value.length;
}

ngAfterViewChecked() {
   this.resize();
 }
}
