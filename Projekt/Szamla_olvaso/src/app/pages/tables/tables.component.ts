import { AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/services/userService/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { UserInfoService } from '../../shared/services/userService/user-info.service';
import { Observable, Subscription } from 'rxjs';
import { Users } from '../../shared/classes/Users';
import * as Bill from '../../shared/classes/Bill';
import { UploadedFile } from '../../shared/classes/uploaded-file';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { TableColumnsComponent } from '../../component/table-columns/table-columns.component';
import { FixFileDataComponent } from '../../component/fix-file-data/fix-file-data.component';
import { ExportService } from '../../shared/services/exportService/export.service';
import { FileService } from '../../shared/services/fileService/file.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss',
})

export class TablesComponent implements OnInit, OnDestroy, AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);
  private subscriptions = new Subscription();
  user$: Observable<any>;
  loggenUser?: Users;

  columns = [
    { name: "fajlNev", show: false },
    { name: "szamlaszam", show: true },
    { name: "szallitoNev", show: true },
    { name: "szallitoAdo", show: true },
    { name: "szallitoIrsz", show: false },
    { name: "szallitoTelepules", show: false },
    { name: "szallitoCim", show: false },
    { name: "fizKelt", show: true },
    { name: "fizTeljesites", show: true },
    { name: "fizHatarido", show: true },
    { name: "fizMod", show: true },
    { name: "netto", show: true },
    { name: "brutto", show: true },
    { name: "afa", show: true },
  ]

  displayedColumns = this.columns.filter((c) => c.show).map((c) => c.name);
  dataSource = new MatTableDataSource<Bill.Bills>();
  dataSourceFiles!: UploadedFile[];
  dataSource2: Bill.Bills[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private dialog: MatDialog, private userService: UserInfoService, private fileService: FileService, private exportService: ExportService) {
    this.user$ = this.authService.currentUser$;
    this.getFileByFileName(this.authService.getUserEmail() as string);
  }

  getFileByFileName(email: string) {
   
    console.log(this.dataSource2);
    (this.fileService.getFileByEmail(email)).subscribe(data2 => {
      this.dataSource2 = [];
      data2.forEach(element => {
        const seged2 = {
          email: element.email,
          fajlNev: element.fajlNev,
          szamlaszam: element.szamlaszam,
          tipus: element.tipus,
          szallitoNev: element.szallitoNev,
          szallitoAdo: element.szallitoAdo,
          szallitoIrsz: element.szallitoIrsz,
          szallitoTelepules: element.szallitoTelepules,
          szallitoCim: element.szallitoCim,
          fizKelt: element.fizKelt,
          fizTeljesites: element.fizTeljesites,
          fizHatarido: element.fizHatarido,
          fizMod: element.fizMod,
          netto: element.netto,
          brutto: element.brutto,
          afa: element.afa,
          tartalom: element.tartalom
        }
        this.dataSource2.push(seged2);
      });
      this.dataSource.data = this.dataSource2;
      this.dataSource._updateChangeSubscription();
    })
  }

  exportToXLSX() {
    if (!Array.isArray(this.dataSource2)) {
      console.error("Hiba: dataSource2 nem tömb!");
      return;
    }
    this.exportService.exportToExcel(this.dataSource2);
  }

  exportToText() {
    if (!Array.isArray(this.dataSource2)) {
      console.error("Hiba: dataSource2 nem tömb!");
      return;
    }
    this.exportService.exportToText(this.dataSource2);
  }

  fileSzerkesztes(bill: Bill.Bills) {
    const dialogRef = this.dialog.open(FixFileDataComponent, {
      data: { fileData: bill as Bill.Bills },
      width: '95%',
      height: '95%'
    });
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(TableColumnsComponent, {
      data: this.columns
    });

    dialogRef.afterClosed().subscribe(() => {
      this.displayedColumns = this.columns.filter((c) => c.show).map((c) => c.name);
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
