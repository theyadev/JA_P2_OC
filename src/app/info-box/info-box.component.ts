import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
})
export class InfoBoxComponent implements OnInit {
  @Input() title?: string;
  @Input() value?: string | number;
  constructor() {}

  ngOnInit(): void {}
}