import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CURRENCIES } from './enums/currencies.enum';
import { Conversion } from './interfaces/conversion.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  rate = signal(1.1);
  step = 0.01;
  lowRate = -0.05;
  highRate = 0.05;
  rateRange: number[] = [];
  rateUpdateTimer = 3000;

  private fb = inject(FormBuilder);
  formGroup: FormGroup = this.fb.group({
    amount: 0,
    fixedRate: 0
  });

  convertedAmount = signal(0);
  CURRENCIES = CURRENCIES;
  currency: string = CURRENCIES.EUR;

  conversionList: Conversion[] = [];

  ngOnInit(): void {
    this.setRateRange();
    this.checkFixedRate();
  }

  // Create an array of rate values from a chosen low to a high range
  setRateRange(): void {
    for (let i = this.lowRate; i < (this.highRate + this.step); i += 0.01) {
      this.rateRange.push(Number(i.toFixed(2)));
    }
  }

  // Choose a random rate from the array of rate range previously defined in setRateRange() at component initialization
  updateRate(): void {
    const randomIndex = Math.floor(Math.random() * this.rateRange.length);
    const randomRate = this.rateRange[randomIndex];
    this.rate.update(v => Number((v + randomRate).toFixed(2)));
    this.updateForm(this.currency as CURRENCIES);
  }

  // Update the base amount, currency display in the template, perform calculation of the converted amount based on rate and selected currency and feed the conversion history list
  updateForm(selectedCurrency: CURRENCIES): void {
    this.currency = selectedCurrency;
    const amount = Number(this.formGroup.get('amount')?.value);
    const convertedAmount = selectedCurrency === CURRENCIES.EUR ? Number((amount * this.rate()).toFixed(2)) : Number((amount / this.rate()).toFixed(2));
    this.convertedAmount.set(convertedAmount);

    const conversion = {
      rate: this.rate(),
      fixedRate: Number(this.formGroup.get('fixedRate')?.value),
      amount,
      selectedCurrency,
      convertedAmount: this.convertedAmount(),
      convertedCurrency: selectedCurrency === CURRENCIES.EUR ? CURRENCIES.USD : CURRENCIES.EUR
    }

    if (this.conversionList.length < 5) {
      this.conversionList.push(conversion);
    } else {
      this.conversionList.shift();
      this.conversionList.push(conversion);
    }
  }

  // TODO: Should be responsible for starting and stopping the variable rate changes and / or using the fixed rate defined by the user for calculations
  // TODO: Fix the event parameter type (no any)
  checkFixedRate(event?: any) {
    const rateInterval = setInterval(() => this.updateRate(), this.rateUpdateTimer);

    if (event && event.checked) {
    clearInterval(rateInterval);
    } else {
      rateInterval;
    }
  }
}
