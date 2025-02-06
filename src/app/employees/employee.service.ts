import { Injectable, PipeTransform } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { debounceTime, delay, switchMap, tap } from 'rxjs/operators';
import { SortColumn, SortDirection } from './sortable.directive';
import { Employee } from './employee.model';

interface SearchResult {
  employees: Employee[];
  total: number;
}

interface State {
  page: number;
  pageSize: number;
  searchTerm: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
}

const compare = (v1: string | number, v2: string | number) => (v1 < v2 ? -1 : v1 > v2 ? 1 : 0);

function sort(employees: Employee[], column: SortColumn, direction: string): Employee[] {
  if (direction === '' || column === '') {
    return employees;
  } else {
    return [...employees].sort((a, b) => {
      const res = compare(a[column], b[column]);
      return direction === 'asc' ? res : -res;
    });
  }
}

function matches(employee: Employee, term: string, pipe: PipeTransform): boolean {
  return (
    employee.name.toLowerCase().includes(term.toLowerCase()) || 
    employee.username.toLowerCase().includes(term.toLowerCase()) ||
    employee.email.toLowerCase().includes(term.toLowerCase()) ||
    employee.website.toLowerCase().includes(term.toLowerCase()) ||
    employee.phone.toLowerCase().includes(term.toLowerCase()) ||
    employee.company.name.toLowerCase().includes(term.toLowerCase()) ||
    employee.company.catchPhrase.toLowerCase().includes(term.toLowerCase()) ||
    employee.company.bs.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.street.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.suite.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.city.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.zipcode.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.geo.lat.toLowerCase().includes(term.toLowerCase()) ||
    employee.address.geo.lng.toLowerCase().includes(term.toLowerCase())
  );
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private _loading$ = new BehaviorSubject<boolean>(true);
  private _search$ = new Subject<void>();
  private _employee$ = new BehaviorSubject<Employee[]>([]);
  private _total$ = new BehaviorSubject<number>(0);

  private _state: State = {
    page: 1,
    pageSize: 8,
    searchTerm: '',
    sortColumn: '',
    sortDirection: '',
  };

  allEmployees: Employee[] = [];  // Initialize with an empty array or a default value.

  constructor(private pipe: DecimalPipe) {
    this._search$
      .pipe(
        tap(() => this._loading$.next(true)),
        debounceTime(200),
        switchMap(() => this._search(this.allEmployees)),
        tap(() => this._loading$.next(false)),
      ).subscribe((result) => {
        this._employee$.next(result.employees);
        this._total$.next(result.total);
      });

    this._search$.next();
  }

  get employee$(): Observable<Employee[]> {
    return this._employee$.asObservable();
  }

  get total$(): Observable<number> {
    return this._total$.asObservable();
  }

  get loading$(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  get page(): number {
    return this._state.page;
  }

  get pageSize(): number {
    return this._state.pageSize;
  }

  get searchTerm(): string {
    return this._state.searchTerm;
  }

  set page(page: number) {
    this._set({ page });
  }

  set pageSize(pageSize: number) {
    this._set({ pageSize });
  }

  set searchTerm(searchTerm: string) {
    this._set({ searchTerm });
  }

  set sortColumn(sortColumn: SortColumn) {
    this._set({ sortColumn });
  }

  set sortDirection(sortDirection: SortDirection) {
    this._set({ sortDirection });
  }

  private _set(patch: Partial<State>): void {
    Object.assign(this._state, patch);
    this._search$.next();
  }

  private _search(data: Employee[]): Observable<SearchResult> {
    const { sortColumn, sortDirection, pageSize, page, searchTerm } = this._state;

    // 1. Sort
    let employees = sort(data, sortColumn, sortDirection);

    // 2. Filter
    employees = employees.filter((employee: Employee) => matches(employee, searchTerm, this.pipe));
    const total = employees.length;

    // 3. Paginate
    employees = employees.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);

    return of({ employees, total });
  }

  toCamelCase(str: string): string {
    return str
      .replace(/[-_](.)/g, (_, char) => char.toUpperCase())
      .replace(/^\w/, first => first.toLowerCase()); 
  }
  
  toTitleCase(str: any){
    return str
      .replace(/\d+/g, '') // Remove numbers
      .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
      .replace(/\s+/g, ' ') // Ensure only single spaces
      .trim() // Remove leading and trailing spaces
      .replace(/\b\w/g, (char: any) => char.toUpperCase()); // Capitalize each word
  }

}
