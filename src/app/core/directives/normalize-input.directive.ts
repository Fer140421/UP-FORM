import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { normalizeFieldValue } from '../utils/data-normalizer';

@Directive({
  selector: 'input[matInput][formControlName], textarea[matInput][formControlName]',
  standalone: true
})
export class NormalizeInputDirective {
  private elementRef = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('blur')
  normalizeOnBlur() {
    const element = this.elementRef.nativeElement;
    const currentValue = element.value;
    const controlName = this.getControlName();
    const normalizedValue = normalizeFieldValue(currentValue, controlName);

    if (currentValue === normalizedValue) {
      return;
    }

    element.value = normalizedValue;
    this.ngControl?.control?.setValue(normalizedValue);
    this.ngControl?.control?.markAsDirty();
  }

  private getControlName(): string | undefined {
    const name = this.ngControl?.name;
    return typeof name === 'string' ? name : undefined;
  }
}
