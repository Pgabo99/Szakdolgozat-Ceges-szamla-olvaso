import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Column {
  name: string;
  value: string;
  show: boolean;
}

@Component({
  selector: 'app-table-columns',
  templateUrl: './table-columns.component.html',
  styleUrl: './table-columns.component.scss'
})

export class TableColumnsComponent {
  selectedOptions: string[] = [];
  data: Column[] = [];

  constructor(public dialogRef: MatDialogRef<TableColumnsComponent>, @Inject(MAT_DIALOG_DATA) public inputData: Column[]) {
    this.data = inputData ?? [];
  }

  test() {
    this.data = this.data.map((col: Column) => {
      col.show = this.selectedOptions.includes(col.value);
      return col;
    });
  }
}
