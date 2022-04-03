import {AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild} from '@angular/core';
import {MaterialInstance, MaterialService} from 'src/app/shared/classes/material.service';
import {Order} from 'src/app/shared/interfaces';

@Component({
  selector: 'app-history-list',
  templateUrl: './history-list.component.html',
  styleUrls: ['./history-list.component.css'],
})
export class HistoryListComponent implements AfterViewInit, OnDestroy {
  @Input() orders!: Order[];
  @ViewChild('modal') modalRef!: ElementRef;
  modal!: MaterialInstance;
  selectedOrder!: Order;

  ngAfterViewInit(): void {
    this.modal = MaterialService.initModal(this.modalRef);
  }

  ngOnDestroy(): void {
    this.modal.destroy();
  }

  computePrice(order: Order): number {
    return order.list.reduce((total, item) => {
      return (total += item.quantity! * item.cost);
    }, 0);
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
    this.modal.open();
  }

  closeModal(): void {
    this.modal.close();
  }
}
