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
  //Az oszlopok rendezéséhez
  private _liveAnnouncer = inject(LiveAnnouncer);
  private subscriptions = new Subscription();
  user$: Observable<any>;
  loggenUser?: Users;

  //Megjelenített oszlopok
  columns = [
    { name: "Fájl neve", value: "fajlNev", show: false },
    { name: "Számlaszám", value: "szamlaszam", show: true },
    { name: "Szállító neve", value: "szallitoNev", show: true },
    { name: "Szállító adószáma", value: "szallitoAdo", show: true },
    { name: "Szállító Irányítószáma", value: "szallitoIrsz", show: false },
    { name: "Szállító Település", value: "szallitoTelepules", show: false },
    { name: "Szállító Címe", value: "szallitoCim", show: false },
    { name: "Fizetés Kelte", value: "fizKelt", show: true },
    { name: "Fizetés Teljesítése", value: "fizTeljesites", show: true },
    { name: "Fizetési Határidő", value: "fizHatarido", show: true },
    { name: "Fizetési Mód", value: "fizMod", show: true },
    { name: "Nettó", value: "netto", show: true },
    { name: "Bruttó", value: "brutto", show: true },
    { name: "Áfa", value: "afa", show: true },
  ]

  displayedColumns = this.columns.filter((c) => c.show).map((c) => c.value);
  dataSource = new MatTableDataSource<Bill.Bills>();
  dataSourceFiles!: UploadedFile[];
  dataSource2: Bill.Bills[] = [];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private dialog: MatDialog, private userService: UserInfoService, private fileService: FileService, private exportService: ExportService) {
    this.user$ = this.authService.currentUser$;
    this.getFilesByEmail(this.authService.getUserEmail() as string);
  }

  /**
   * Lekéri a felhasználó számláit és feltölti a dataSource, és DataSource2 tömböket azzal
   * @param email felhasználó email címe
   */
  getFilesByEmail(email: string) {
    (this.fileService.getFileByEmail(email)).subscribe(data2 => {
      this.dataSource2 = [];
      data2.forEach(element => {
        const seged2 = {
          email: element.email,
          fajlNev: element.fajlNev,
          szamlaszam: element.szamlaszam,
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
        }
        this.dataSource2.push(seged2);
      });
      this.dataSource.data = this.dataSource2;
      this.dataSource._updateChangeSubscription();
    })
  }

  // XLSX formátumba exportálás
  exportToXLSX() {
    if (!Array.isArray(this.dataSource2)) {
      alert("Sikertelen");
      return;
    }
    this.exportService.exportToExcel(this.dataSource2);
  }

  // TXT formátumba exportálás
  exportToText() {
    if (!Array.isArray(this.dataSource2)) {
     alert("Sikertelen");
      return;
    }
    this.exportService.exportToText(this.dataSource2);
  }

  // Számlák szerkesztése dialógus megjelenítése
  fileEdit(bill: Bill.Bills) {
    const dialogRef = this.dialog.open(FixFileDataComponent, {
      data: { fileData: bill as Bill.Bills },
      width: '95%',
      height: '95%'
    });
  }

  // Megjelenített oszlopok dialógus
  showColumns(): void {
    let dialogRef = this.dialog.open(TableColumnsComponent, {
      data: this.columns
    });

    dialogRef.afterClosed().subscribe(() => {
      this.displayedColumns = this.columns.filter((c) => c.show).map((c) => c.value);
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

  //Oszlopok rendezése
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
