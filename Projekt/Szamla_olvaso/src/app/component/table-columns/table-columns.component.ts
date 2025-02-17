import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Column {
  name: string;
  show: boolean;
}

@Component({
  selector: 'app-table-columns',
  templateUrl: './table-columns.component.html',
  styleUrl: './table-columns.component.scss'
})



export class TableColumnsComponent {
  selectedOptions: string[] = [];  // Az lehet egy string tömb
  data: Column[] = [];  // A data változó egy Column típusú objektumokat tartalmazó tömb
  
  constructor(
    public dialogRef: MatDialogRef<TableColumnsComponent>,
    @Inject(MAT_DIALOG_DATA) public inputData: Column[]  // A bemeneti adat típusa Column[]
  ) {
    // inputData-t hozzárendeljük a data tömbhöz
    this.data = inputData ?? [];
  }

  test() {
    // A data tömbön végzünk egy map műveletet, az indexOf használatával
    this.data = this.data.map((col: Column) => {
      col.show = this.selectedOptions.includes(col.name); // Kicsit tisztább verzió
      return col;
    });
  }
}
