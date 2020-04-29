import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedQuestionsComponent } from './received-questions.component';

describe('ReceivedQuestionsComponent', () => {
  let component: ReceivedQuestionsComponent;
  let fixture: ComponentFixture<ReceivedQuestionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceivedQuestionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivedQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
