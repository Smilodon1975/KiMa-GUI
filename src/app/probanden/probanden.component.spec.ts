import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProbandenComponent } from './probanden.component';

describe('ProbandenComponent', () => {
  let component: ProbandenComponent;
  let fixture: ComponentFixture<ProbandenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProbandenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProbandenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
