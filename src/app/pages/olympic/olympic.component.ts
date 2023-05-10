import type Olympic from 'src/app/core/models/Olympic';
import type { ChartDataset, ChartOptions } from 'chart.js';
import type { Subscription } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';

@Component({
  selector: 'app-olympic',
  templateUrl: './olympic.component.html',
  styleUrls: [],
})
export class OlympicComponent implements OnInit {
  public olympic?: Olympic;
  public entries: number = 0;
  public medals: number = 0;
  public athletes: number = 0;

  public lineChartLabels: string[] = [];
  public lineChartDatasets: ChartDataset<'line', number[]>[] = [
    {
      data: [],
      label: 'Medals',
      spanGaps: true,
    },
  ];
  public lineChartOptions: ChartOptions<'line'> = {
    responsive: false,
    scales: {
      y: {
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };
  public lineChartLegend = false;

  private subscription?: Subscription;

  constructor(
    private olympicService: OlympicService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.olympicService
      .getOlympics()
      .subscribe(this._handleOlympics.bind(this));
  }

  _handleOlympics(olympics: Olympic[]): void {
    if (!olympics || olympics.length === 0) return;

    const paramsId = this.route.snapshot.paramMap.get('id');

    if (!paramsId) return;

    const id = parseInt(paramsId);

    this.olympic = olympics.find((o) => o.id === id);

    if (!this.olympic) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.entries = this.olympic.participations.length;
    this.medals = this.olympic.participations
      .map((p) => p.medalsCount)
      .reduce((a, b) => a + b, 0);
    this.athletes = this.olympic.participations
      .map((p) => p.athleteCount)
      .reduce((a, b) => a + b, 0);

    const lowestYear = Math.min(
      ...this.olympic.participations.map((p) => p.year)
    );

    const highestYear = Math.max(
      ...this.olympic.participations.map((p) => p.year)
    );

    const labels = [];
    const data = [];

    for (let year = lowestYear; year <= highestYear; year++) {
      const participation = this.olympic.participations.find(
        (p) => p.year === year
      );

      if (participation) {
        labels.push(year.toString());
        data.push(participation.medalsCount);

        continue;
      }

      if ((year - lowestYear) % 2 === 1) continue;
      if (highestYear - year < 2) continue;

      labels.push(year.toString());
      data.push(NaN);
    }

    this.lineChartLabels = labels;
    this.lineChartDatasets[0].data = data;

    // this.lineChartLabels = this.olympic.participations.map((p) =>
    //   p.year.toString()
    // );
    // this.lineChartDatasets[0].data = this.olympic.participations.map(
    //   (p) => p.medalsCount
    // );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
