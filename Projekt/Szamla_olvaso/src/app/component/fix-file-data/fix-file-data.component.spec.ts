import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixFileDataComponent } from './fix-file-data.component';

describe('FixFileDataComponent', () => {
  let component: FixFileDataComponent;
  let fixture: ComponentFixture<FixFileDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FixFileDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixFileDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
