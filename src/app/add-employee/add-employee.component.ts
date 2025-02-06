import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EmployeeService } from '../employees/employee.service';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './add-employee.component.html',
  styleUrl: './add-employee.component.scss'
})

export class AddEmployeeComponent {
  employeeForm!: FormGroup;

  @Input() isLoading: boolean = false ;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.createEmployeeForm();
  }

  // Create the employee form
  createEmployeeForm() {
    this.employeeForm = this.fb.group({
      id: [null, Validators.required],
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', ],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],

      website: ['', ],

      companyname: ['', ],
      catchPhrase: ['', ],
      bs: ['', ],

      street: ['', ],
      suite: ['', ],
      city: ['', Validators.required],
      zipcode: ['', ],

      lat: ['', ],
      lng: ['', ]

    });
  }


  getModel(){
    const model = {
      id: this.employeeForm.get('id')?.value,
      name: this.employeeForm.get('name')?.value,
      username: this.employeeForm.get('username')?.value,
      email: this.employeeForm.get('email')?.value,
      phone: this.employeeForm.get('phone')?.value,
      website: this.employeeForm.get('website')?.value,
      company : {
        name: this.employeeForm.get('companyname')?.value,
        catchPhrase: this.employeeForm.get('catchPhrase')?.value,
        bs: this.employeeForm.get('bs')?.value,
      },
      address: {
        street: this.employeeForm.get('street')?.value,
        suite: this.employeeForm.get('suite')?.value,
        city: this.employeeForm.get('city')?.value,
        zipcode: this.employeeForm.get('zipcode')?.value,
        geo:{
          lat: this.employeeForm.get('lat')?.value,
          lng: this.employeeForm.get('lng')?.value
        }
      }
    };

    return model;

  }

  // Submit form data
  errors: boolean = false ;
  errorString: string = '';

  onSubmit() {
    if (this.employeeForm.valid) {
      this.saved.emit(this.getModel());
      this.employeeForm.reset();
      this.createEmployeeForm();
      this.errors = false;
    } else {
      this.errors = true;
      let arr : any = [];
      Object.keys(this.employeeForm.controls).forEach(controlName => {
        const control = this.employeeForm.get(controlName);
        if (control?.invalid) arr.push(this.employeeService.toTitleCase(controlName));
      });

      this.errorString = arr.join(', ');
    }
  }

  writeNumbers(event: any, type: any){
    // .replace(/\D/g, '');
    this.employeeForm.get(type)?.setValue(event.target.value.replace(/\D/g, ''));
  }

  writeUserName(event: any){
    this.employeeForm.get('username')?.setValue(this.employeeService.toTitleCase(event.target.value));
  }

  writeName(event: any){ 
    let str = event.target.value;
    this.employeeForm.get('name')?.setValue(`${str[0].toUpperCase()}${str.slice(1,str.length)}`);
  }

}
