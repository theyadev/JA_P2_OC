import type Olympic from 'src/app/core/models/Olympic';

import type { ChartOptions, ChartDataset, ChartEvent } from 'chart.js';
import type { Observable, Subscription } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { OlympicService } from 'src/app/core/services/olympic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  public olympics$: Observable<Olympic[]> = of([]);
  public noJOs: number = 0;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels: string[] = [];
  public pieChartDatasets: ChartDataset<'pie', number[]>[] = [
    {
      data: [],
      label: 'Medals',
    },
  ];
  public pieChartLegend = false;

  private pieChartIds: number[] = [];
  private subscription?: Subscription;

  constructor(private olympicService: OlympicService, private router: Router) {}

  ngOnInit(): void {
    this.olympics$ = this.olympicService.getOlympics();

    this.subscription = this.olympics$.subscribe(
      this._handleOlympics.bind(this)
    );
  }

  _handleOlympics(olympics: Olympic[]) {
    const participations = olympics
      .map((olympic) => olympic.participations.map((p) => p.id))
      .flat();

    const uniqueIds = new Set(participations);

    this.noJOs = uniqueIds.size;

    this.pieChartLabels = olympics.map((o) => o.country);
    this.pieChartIds = olympics.map((o) => o.id);

    const medalCounts = olympics
      .map((o) =>
        o.participations
          .map((p) => p.medalsCount)
          .reduce((acc, curr) => acc + curr, 0)
      )
      .flat();

    this.pieChartDatasets[0].data = medalCounts;
  }

  onChartClick(event: { event?: ChartEvent; active?: any[] }) {
    const index = event.active?.[0].index;

    if (index === undefined) return;

    this.router.navigate(['olympic', this.pieChartIds[index]]);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
