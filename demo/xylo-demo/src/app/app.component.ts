import { Component, OnInit } from '@angular/core';
import { XyloService } from './services/xylo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'xylo-demo';

  constructor(private xyloService: XyloService) {
    this.xyloService.load();
  }

  ngOnInit() {
  }
}
