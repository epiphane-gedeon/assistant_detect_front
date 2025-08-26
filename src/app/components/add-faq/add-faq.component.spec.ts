import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { AddFaqComponent } from './add-faq.component';

describe('AddFaqComponent', () => {
  let component: AddFaqComponent;
  let fixture: ComponentFixture<AddFaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddFaqComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AddFaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.faqForm.get('question')?.value).toBe('');
    expect(component.faqForm.get('procede')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const questionControl = component.faqForm.get('question');
    const procedeControl = component.faqForm.get('procede');

    expect(questionControl?.hasError('required')).toBeTruthy();
    expect(procedeControl?.hasError('required')).toBeTruthy();
  });
});
