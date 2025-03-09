// payments.component.ts
import { Component, OnInit } from '@angular/core';
import { FeePaymentService } from '../../../services/fee-payment.service';
import { FeePayment } from '../../../models/fee-payement';
import { Student } from '../../../models/student';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  filterStudentId?: number;
  filterMonth?: string;
  payments: FeePayment[] = [];
  isFormOpen = false;
  formMode: 'create' | 'update' = 'create';
  paymentForm: FeePayment = this.getDefaultForm();

  constructor(private paymentService: FeePaymentService) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  trackByPayment(index: number, payment: FeePayment): number {
    return payment.id;
  }

  private getDefaultForm(): FeePayment {
    return {
      id: 0,
      studentId: 0,
      amount: 0,
      date: '',
      status: false,
      paymentMonth: ''
    };
  }

  filterByMonth() {
    if (this.filterMonth) {
      this.paymentService.getByMonth(this.filterMonth).subscribe({
        next: (data) => this.payments = data,
        error: (err) => console.error('Filter error:', err)
      });
    }
  }

  filterByStudent() {
    if (this.filterStudentId) {
      this.paymentService.getByStudent(this.filterStudentId).subscribe({
        next: (data) => this.payments = data,
        error: (err) => console.error('Filter error:', err)
      });
    }
  }

  clearFilters() {
    this.filterStudentId = undefined;
    this.filterMonth = undefined;
    this.loadPayments();
  }

  openForm(mode: 'create' | 'update', payment?: FeePayment): void {
    this.formMode = mode;
    this.isFormOpen = true;
    this.paymentForm = payment ? { ...payment } : this.getDefaultForm();
  }

  submitForm(): void {
    const paymentDto: FeePayment = {
        ...this.paymentForm
    };

    const serviceCall = this.formMode === 'create' 
        ? this.paymentService.createPayment(paymentDto)
        : this.paymentService.updatePayment(paymentDto.id, paymentDto);

    serviceCall.subscribe({
        next: () => {
            this.loadPayments();
            this.closeForm();
        },
        error: (err) => console.error('Operation failed:', err)
    });
  }

  loadPayments(): void {
      this.paymentService.getAllPayments().subscribe({
          next: (data) => this.payments = data,
          error: (err) => console.error('Error loading payments:', err)
      });
  }


  deletePayment(id: number): void {
    if (confirm('Are you sure you want to delete this payment?')) {
      this.paymentService.deletePayment(id).subscribe({
        next: () => this.payments = this.payments.filter(p => p.id !== id),
        error: (err) => console.error('Delete failed:', err)
      });
    }
  }

  closeForm(): void {
    this.isFormOpen = false;
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }
}