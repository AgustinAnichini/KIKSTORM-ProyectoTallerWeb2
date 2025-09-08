import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgForOf } from '@angular/common';
import { environment } from '../../../../../environment/environment.prod.';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FooterComponent } from '../../../../shared/footer/footer.component';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgForOf, ToastModule, FooterComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [MessageService],

})
export class AdminComponent implements OnInit {
 marcas: { id: number; nombre: string }[] = [];
  talles: { id: number; numero: number }[] = [];
  colores: { id: number; nombre: string }[] = [];
  bgImg = '/img/bg-jordan.jpg';

  productoForm!: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private messageService: MessageService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.crearFormulario();
    this.getMarcas();
    this.getTalles();
    this.getColores();
  }

  crearFormulario() {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      marcaId: [null, Validators.required],
      colorId: [null, Validators.required],
      sexo: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      imagen: [null, Validators.required],
      descripcion: [''],
      stock: this.fb.array([]),
    });
  }

  get stockControls() {
    return (this.productoForm.get('stock') as FormArray).controls;
  }

  getMarcas(): void {
    this.http.get<{ id: number; nombre: string }[]>(`${environment.api_url}/marca`).subscribe({
      next: (data) => {
        this.marcas = data;
      },
      error: (err) => console.error('Error al cargar marcas', err),
    });
  }

  getTalles(): void {
    this.http.get<{ id: number; numero: number }[]>(`${environment.api_url}/talle`).subscribe({
      next: (data) => {
        this.talles = data;
        // Llenar el FormArray de stock con controles por cada talle
        const stockFA = this.productoForm.get('stock') as FormArray;
        stockFA.clear();
        this.talles.forEach(() => {
          stockFA.push(
            this.fb.group({
              activo: [false],
              cantidad: [{ value: 0, disabled: true }, [Validators.min(0)]],
            })
          );
        });
      },
      error: (err) => console.error('Error al cargar talles', err),
    });
  }

  getColores(): void {
    this.http.get<{ id: number; nombre: string }[]>(`${environment.api_url}/color`).subscribe({
      next: (data) => {
        this.colores = data;
      },
      error: (err) => console.error('Error al cargar colores', err),
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de archivo inválido',
        detail: 'Se permiten solo .jpeg, .png y .webp',
      });
      this.productoForm.patchValue({ imagen: null });
      return;
    }
    this.productoForm.patchValue({ imagen: file });
    this.productoForm.get('imagen')?.updateValueAndValidity();
  }

  toggleTalle(index: number): void {
    const control = (this.productoForm.get('stock') as FormArray).at(index);
    const activo = control.get('activo')?.value;

    if (activo) {
      control.get('cantidad')?.enable();
      control.get('cantidad')?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      control.get('cantidad')?.disable();
      control.get('cantidad')?.clearValidators();
      control.get('cantidad')?.setValue(0);
    }
    control.get('cantidad')?.updateValueAndValidity();
  }

  guardarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: 'Completa correctamente todos los campos obligatorios',
      });
      return;
    }

    const formData = new FormData();
    const formValue = this.productoForm.value;

    formData.append('nombre', formValue.nombre);
    formData.append('marcaId', formValue.marcaId.toString());
    formData.append('colorId', formValue.colorId.toString());
    formData.append('sexo', formValue.sexo);
    formData.append('precio', formValue.precio.toString());
    formData.append('descripcion', formValue.descripcion || '');
    formData.append('imagen', formValue.imagen);

    this.http.post<{ id: number }>(`${environment.api_url}/zapatilla`, formData).subscribe({
      next: (res) => {
        // filtrar talles activos y cantidad > 0
        const stocksToCreate = this.talles
          .map((talle, i) => ({
            talleId: talle.id,
            activo: formValue.stock[i].activo,
            cantidad: formValue.stock[i].cantidad,
          }))
          .filter((item) => item.activo && item.cantidad > 0);

        if (stocksToCreate.length === 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto guardado',
            detail: 'Se guardó el producto sin stock.',
          });
          this.resetForm();
          this.router.navigate(['/productos']);
          return;
        }

        const stockForm = new FormData();
        stockForm.append('zapatillaId', res.id.toString());
        stocksToCreate.forEach((item) => {
          stockForm.append('talleId', item.talleId.toString());
          stockForm.append(`cantidad_${item.talleId}`, item.cantidad.toString());
        });

        this.http.post(`${environment.api_url}/stock`, stockForm).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto guardado',
              detail: 'Se guardó el producto con stock.',
            });
            this.resetForm();
            this.router.navigate(['/productos']);
          },
          error: (err) => {
            console.error('Error al crear stock:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error al guardar stock',
              detail: 'Se guardó el producto pero hubo un error al guardar el stock.',
            });
          },
        });
      },
      error: (err) => {
        console.error('Error al crear zapatilla:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al guardar producto',
          detail: 'Hubo un error al guardar el producto.',
        });
      },
    });
  }

  resetForm(): void {
    this.productoForm.reset();
    // Reset stock formarray y deshabilitar inputs cantidad
    const stockFA = this.productoForm.get('stock') as FormArray;
    stockFA.controls.forEach((control) => {
      control.get('activo')?.setValue(false);
      control.get('cantidad')?.setValue(0);
      control.get('cantidad')?.disable();
    });
  }
}