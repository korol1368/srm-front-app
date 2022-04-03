import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {Chart, ChartConfiguration, registerables} from 'chart.js';
import {Subscription} from 'rxjs';
import {AnalyticsPage} from '../shared/interfaces';
import {AnalyticsService} from '../shared/services/analytics.service';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css'],
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gain') gainRef!: ElementRef;
  @ViewChild('order') orderRef!: ElementRef;
  average!: number;
  pending = true;
  aSub!: Subscription;
  constructor(private analyticsService: AnalyticsService) {
    Chart.register(...registerables);
  }

  ngAfterViewInit(): void {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)',
    };

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)',
    };

    this.aSub = this.analyticsService.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.average = data.average;

      gainConfig.labels = data.chart.map((item) => item.label);
      gainConfig.data = data.chart.map((item) => item.gain);

      orderConfig.labels = data.chart.map((item) => item.label);
      orderConfig.data = data.chart.map((item) => item.order);

      const gainCtx = this.gainRef.nativeElement.getContext('2d');
      const orderCtx = this.orderRef.nativeElement.getContext('2d');
      gainCtx.canvas.height = '300px';
      orderCtx.canvas.height = '300px';

      new Chart(gainCtx, {
        type: 'line',
        options: {
          responsive: true,
        },
        data: {
          labels: gainConfig.labels,
          datasets: [
            {
              label: gainConfig.label,
              data,
              borderColor: gainConfig.color,
              stepped: false,
              fill: false,
            },
          ],
        },
      });

      new Chart(orderCtx, {
        type: 'line',
        options: {
          responsive: true,
        },
        data: {
          labels: orderConfig.labels,
          datasets: [
            {
              label: orderConfig.label,
              data,
              borderColor: orderConfig.color,
              stepped: false,
              fill: false,
            },
          ],
        },
      });
      this.pending = false;
    });
  }

  ngOnDestroy(): void {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }
}

// function createChartConfig({labels, data, label, color}: ChartConfig): ChartConfiguration<'line'> {
//   return {
//     type: 'line',
//     options: {
//       responsive: true,
//     },
//     data: {
//       labels,
//       datasets: [
//         {
//           label,
//           data,
//           borderColor: color,
//           stepped: false,
//           fill: false,
//         },
//       ],
//     },
//   };
// }
