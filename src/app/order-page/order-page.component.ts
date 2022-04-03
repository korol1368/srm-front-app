import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {MaterialInstance, MaterialService} from '../shared/classes/material.service';
import {Order, OrderPosition} from '../shared/interfaces';
import {OrdersService} from '../shared/services/orders.service';
import {OrderService} from './order.service';

@Component({
  selector: 'app-order-page',
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css'],
  providers: [OrderService],
})
export class OrderPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('modal') modalRef!: ElementRef;
  modal!: MaterialInstance;
  isRoot!: boolean;
  pending = false;
  oSub!: Subscription;
  constructor(private router: Router, public orderService: OrderService, private ordersService: OrdersService) {}

  ngOnInit(): void {
    this.isRoot = this.router.url === '/order';
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isRoot = this.router.url === '/order';
      }
    });
  }

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy(): void {
    this.modal.destroy();
    if (this.oSub) {
      this.oSub.unsubscribe();
    }
  }

  openModal(): void {
    this.modal.open();
  }

  cancel(): void {
    this.modal.close();
  }

  removePosition(orderPosition: OrderPosition) {
    this.orderService.remove(orderPosition);
  }

  submit(): void {
    this.pending = true;
    const newOrder: Order = {
      list: this.orderService.list.map((item) => {
        delete item._id;
        return item;
      }),
    };

    this.oSub = this.ordersService.create(newOrder).subscribe({
      next: (order) => {
        MaterialService.toast(`Заказ ${order.order} был добавлен`);
        this.orderService.clear();
      },
      error: (e) => {
        MaterialService.toast(e.error.message);
      },
      complete: () => {
        this.modal.close();
        this.pending = false;
      },
    });
  }
}
