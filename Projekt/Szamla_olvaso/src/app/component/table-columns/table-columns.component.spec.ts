import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableColumnsComponent } from './table-columns.component';

describe('TableColumnsComponent', () => {
  let component: TableColumnsComponent;
  let fixture: ComponentFixture<TableColumnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableColumnsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableColumnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
