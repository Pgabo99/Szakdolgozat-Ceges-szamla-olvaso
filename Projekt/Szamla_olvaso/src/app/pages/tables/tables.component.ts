import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { UserInfoService } from '../../shared/services/user-info.service';
import { Observable, Subscription } from 'rxjs';
import { Users } from '../../shared/classes/Users';
import * as Bill from '../../shared/classes/Bill';
import { UploadedFile } from '../../shared/classes/uploaded-file';
import { FileServiceService } from '../../shared/services/file-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { TableColumnsComponent } from '../../component/table-columns/table-columns.component';
import { FixFileDataComponent } from '../../component/fix-file-data/fix-file-data.component';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  styleUrl: './tables.component.scss'
})
export class TablesComponent implements OnInit, OnDestroy, AfterViewInit {



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
  dataSource2!: Bill.Bills[];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private authService: AuthService, private dialog: MatDialog, private userService: UserInfoService, private fileService: FileServiceService) {
    this.user$ = this.authService.currentUser$;

    this.subscriptions.add(this.userService.getUserByEmail(this.authService.getUserEmail() as string).subscribe(data => {
      if (data[0] != null) {
        this.loggenUser = data[0];
        if (this.loggenUser.files) {
          let count = Object.keys(this.loggenUser.files).length;
          this.dataSourceFiles = new Array(count);
          this.dataSource2 = new Array(count);
          for (let key in this.loggenUser.files) {
            if (count != 0) {
              if (this.loggenUser.files.hasOwnProperty(key)) {
                const seged = {
                  url: key || 'default-url',
                  fileName: this.loggenUser.files[key].fileName,
                  uploadDate: this.loggenUser.files[key].uploadDate
                }
                count--;
                this.dataSourceFiles[count] = (seged);
                this.getFileByFileName(seged.fileName,this.loggenUser.email, count)
              }
            }
          }
        }
      }
    }))

  }

  getFileByFileName(fileName: string,email:string, count: number) {
    (this.fileService.getFileByName(fileName,email)).subscribe(data2 => {
      const seged2 = {
        email: data2[0].email,
        fajlNev: data2[0].fajlNev,
        szamlaszam: data2[0].szamlaszam,
        tipus: data2[0].tipus,
        szallitoNev: data2[0].szallitoNev,
        szallitoAdo: data2[0].szallitoAdo,
        szallitoIrsz: data2[0].szallitoIrsz,
        szallitoTelepules: data2[0].szallitoTelepules,
        szallitoCim: data2[0].szallitoCim,
        szallitoEgybe: data2[0].szallitoEgybe,
        fizKelt: data2[0].fizKelt,
        fizTeljesites: data2[0].fizTeljesites,
        fizHatarido: data2[0].fizHatarido,
        fizMod: data2[0].fizMod,
        netto: data2[0].netto,
        brutto: data2[0].brutto,
        afa: data2[0].afa,
        tartalom: data2[0].tartalom
      }

      this.dataSource2[count] = seged2;
      this.dataSource.data = this.dataSource2;
    })

  }

  fileSzerkesztes(bill:Bill.Bills) {
    const dialogRef = this.dialog.open(FixFileDataComponent, {
      data: { fileData: bill as Bill.Bills},
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

  ngAfterViewInit(): void {
    // Beállítjuk a MatSort-ot a dataSource-ra
    this.dataSource.sort = this.sort;
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
