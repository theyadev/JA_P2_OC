import type Olympic from 'src/app/core/models/Olympic';
import type { ChartDataset, ChartOptions } from 'chart.js';
import type { Subscription } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OlympicService } from 'src/app/core/services/olympic.service';

function sum(a: number, b: number): number {
  return a + b;
}
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

  public lineChartLabels: number[] = [];
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

  _computeLineChartData(): void {
    if (!this.olympic) {
      this.router.navigate(['/not-found']);
      return;
    }

    this.entries = this.olympic.participations.length;

    const [years, medals, athletes] = this.olympic.participations.reduce(
      ([years, medals, athletes], participation) => {
        years.push(participation.year);
        medals.push(participation.medalsCount);
        athletes.push(participation.athleteCount);

        return [years, medals, athletes];
      },
      [[], [], []] as [number[], number[], number[]]
    );

    this.medals = medals.reduce(sum, 0);
    this.athletes = athletes.reduce(sum, 0);

    const [lowestYear, highestYear] = [Math.min(...years), Math.max(...years)];

    const labels = [];
    const data = [];

    for (let year = lowestYear; year <= highestYear; year++) {
      const participation = this.olympic.participations.find(
        (p) => p.year === year
      );

      if (participation) {
        labels.push(year);
        data.push(participation.medalsCount);

        continue;
      }

      if ((year - lowestYear) % 2 === 1) continue;
      if (highestYear - year < 2) continue;

      labels.push(year);
      data.push(NaN);
    }

    this.lineChartLabels = labels;
    this.lineChartDatasets[0].data = data;
  }

  _handleOlympics(olympics: Olympic[]): void {
    if (!olympics || olympics.length === 0) return;

    const paramsId = this.route.snapshot.paramMap.get('id');

    if (!paramsId) return;

    const id = parseInt(paramsId);

    this.olympic = olympics.find((o) => o.id === id);

    this._computeLineChartData();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
