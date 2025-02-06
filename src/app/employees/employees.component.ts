import { Component, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbdSortableHeader, SortEvent } from './sortable.directive';
import { FormsModule } from '@angular/forms';
import { NgbHighlight, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService } from './employee.service';
import { DecimalPipe } from '@angular/common';
import { CommonModule } from '@angular/common';  // Add this import
import { EmployeesSEndpoint } from './employees.endpoint';
import { SubSink } from 'subsink';
import { AddEmployeeComponent } from "../add-employee/add-employee.component";
import { AlertService } from '@full-fledged/alerts';


@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [FormsModule, NgbHighlight, NgbdSortableHeader, NgbPaginationModule, CommonModule, AddEmployeeComponent],  // Add CommonModule here
  providers: [EmployeeService, EmployeesSEndpoint, DecimalPipe],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy {
  employee$!: Observable<any>;
  total$!: Observable<number>;
  subsink = new SubSink();

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader>;

  constructor(
    public service: EmployeeService, 
    private endPoint: EmployeesSEndpoint,
    private alertService: AlertService,
    // private spinner: NgxSpinnerService
  ) {  }

  
  ngOnInit(): void {
    this.employee$ = this.service.employee$;
    this.total$ = this.service.total$;

    // this.spinner.show();
    this.subsink.sink = this.endPoint.getEmployees().subscribe((res)=>{
      // this.spinner.hide();
      this.service.allEmployees = res ;
    }, (error: any)=>{
      // this.spinner.hide();
      console.log(error);
    })
  }



  isLoading: boolean = false ;

  saveEmployee(employee: any) {

    this.isLoading = true ;

    this.subsink.sink = this.endPoint.saveEmployee(employee).subscribe((res)=>{

      this.service.allEmployees.push(employee);
      this.isLoading = false ;
      this.alertService.success(`${employee.name} has been added successfully!`);
    }, (error: any)=>{  
      console.log(error);
      this.isLoading = false ;
      this.alertService.danger(`Error in adding employee: ${employee.name} due ${error}`, );
    })
  }

  onSort({ column, direction }: SortEvent) {
    this.headers.forEach((header) => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });

    this.service.sortColumn = column;
    this.service.sortDirection = direction;
  }




  ngOnDestroy() {
    this.subsink.unsubscribe();
  }

}
