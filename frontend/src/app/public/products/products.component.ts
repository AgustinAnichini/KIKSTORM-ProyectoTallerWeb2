import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShoeComponent } from '../shoe/shoe.component';
import { FiltersComponent } from '../filters/filters.component';
import { Zapatilla } from '../../../interfaces';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment.prod.';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProductDetailComponent }        from '../product-detail/product-detail.component'; 
import { FooterComponent } from '../../shared/footer/footer.component';
import { ZapatillaService } from '../../api/services/zapatilla/zapatilla.service';
import { forkJoin, Subscription } from 'rxjs';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, ShoeComponent, FiltersComponent, FooterComponent, GalleriaModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
  providers: [DialogService],
})
export class ProductsComponent implements OnInit, OnDestroy {
  zapatillas: Zapatilla[] = [];
  filteredZapatillas: Zapatilla[] = []; 
  searchTerm: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null; 
  marcas: string[] = [];
  talles: number[] = [];
  colores: string[] = [];
  sexos: string[] = ['hombre', 'mujer', 'niño'];

  selectedFilters = {
    marcas: [] as string[],
    talles: [] as number[],
    colores: [] as string[],
    sexos: [] as string[],
  };

  http = inject(HttpClient)
  router = inject(Router);
  route = inject(ActivatedRoute)
  dialogService = inject(DialogService)
  zapatillaService = inject(ZapatillaService)

  loading = true;
  error = '';

  private subscriptions: Subscription[] = [];
  private ref?: DynamicDialogRef;
  constructor() {}

  ngOnInit(): void {
    this.fetchFilters();
    this.route.queryParamMap.subscribe((params) => {
      this.selectedFilters.marcas = this.parseParam(params.get('marcas'));
      this.selectedFilters.talles = this.parseParam(params.get('talles'))
        .map(Number)
        .filter((n) => !isNaN(n));
      this.selectedFilters.colores = this.parseParam(params.get('colores'));
      this.selectedFilters.sexos = this.parseParam(params.get('sexos'));
      this.fetchZapatillas();
    });
  }

  ngOnDestroy(): void {
    this.ref?.close();
    this.subscriptions.forEach((sub) => sub.unsubscribe()); 
  }

  private parseParam(value: string | null): string[] {
    return value ? value.split(',').map((v) => v.trim().toLowerCase()) : [];
  }

  private fetchFilters(): void {
   const filters$ = [
      this.zapatillaService.getMarcas(),
      this.zapatillaService.getTalles(),
      this.zapatillaService.getColores(),
    ];

    // para esperar todas las respuestas
    this.subscriptions.push(
      forkJoin(filters$).subscribe({
        next: ([marcas, talles, colores]) => {
          this.marcas = marcas as string[]
          this.talles = talles.map(t => Number(t)) as number[]
          this.colores = colores as string[]
        },
        error: (err) => console.error('Error al cargar filtros:', err),
      })
    );
  }


  private fetchZapatillas(): void {
  this.loading = true;
  
  const queryParams = this.buildQueryParams();
  
  this.subscriptions.push(
    this.zapatillaService.getZapatillasFiltered(queryParams).subscribe({
      next: this.handleZapatillasResponse.bind(this),
      error: this.handleZapatillasError.bind(this),
    })
  );
}

private buildQueryParams(): any {
  const { marcas, talles, colores, sexos } = this.selectedFilters;
  const queryParams: any = {
    marcas: marcas.join(','),
    talles: talles.join(','),
    colores: colores.join(','),
    sexos: sexos.join(','),
  };

  if (this.searchTerm) queryParams.search = this.searchTerm;
  if (this.minPrice !== null) queryParams.minPrice = this.minPrice;
  if (this.maxPrice !== null) queryParams.maxPrice = this.maxPrice;

  return queryParams;
}

private handleZapatillasResponse(data: Zapatilla[]): void {
  this.zapatillas = data;
  this.filteredZapatillas = data;
  this.loading = false;
}

private handleZapatillasError(err: any): void {
  this.error = 'Error al cargar las zapatillas';
  console.error(err);
  this.loading = false;
}


  onSearchTermChange(value: string) {
    this.searchTerm = value;
    this.updateQueryParams();
    this.fetchZapatillas();
  }


  onMinPriceChange(value: number | null) {
    this.minPrice = value;
    this.updateQueryParams();
    this.fetchZapatillas();
  }

  onMaxPriceChange(value: number | null) {
    this.maxPrice = value;
    this.updateQueryParams();
    this.fetchZapatillas();
  }

  toggleFilter<T>(filter: T[], value: T): void {
  const index = filter.indexOf(value);
  index > -1 ? filter.splice(index, 1) : filter.push(value);
  this.updateQueryParams();
  this.fetchZapatillas();
}

 toggleMarca(marca: string) {
    this.toggleFilter(this.selectedFilters.marcas, marca.toLowerCase());
  }

  toggleTalle(talle: number) {
    this.toggleFilter(this.selectedFilters.talles, talle);
  }

  toggleColor(color: string) {
    this.toggleFilter(this.selectedFilters.colores, color.toLowerCase());
  }

  toggleSexo(sexo: string) {
    this.toggleFilter(this.selectedFilters.sexos, sexo.toLowerCase());
  }

  private updateQueryParams(): void {
    const { marcas, talles, colores, sexos } = this.selectedFilters;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        marcas: marcas.length ? marcas.join(',') : null,
        talles: talles.length ? talles.join(',') : null,
        colores: colores.length ? colores.join(',') : null,
        sexos: sexos.length ? sexos.join(',') : null,
        search: this.searchTerm ? this.searchTerm : null,
        minPrice: this.minPrice !== null ? this.minPrice : null,
        maxPrice: this.maxPrice !== null ? this.maxPrice : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

 openDetail(z: Zapatilla) {
  this.ref = this.dialogService.open(ProductDetailComponent, {
    header : z.nombre,
    data   : { id: z.id },
    width  : '70vw',
    modal  : true,

    styleClass: 'product-dialog dark-dialog',

    contentStyle: { padding: '0' },

    dismissableMask: true,

    ...(<any>{ autoFocus: false, focusTrap: false })
  });
}

imagesSecondGallery: any[] = [
    {
      itemImageSrc: '/img/destacado-1.webp',
      thumbnailImageSrc: 'img/hero-img-thumb.webp',
      alt: 'Adidas superstar',
      title: 'El Ícono de Estilo y Comodidad'
    }, 
    {
      itemImageSrc: '/img/destacado-3.webp',
      thumbnailImageSrc: 'img/hero-img-3-thumb.webp',
      alt: 'Adidas campus',
      title: 'Clásico Urbana con un Toque Sofisticado'
    },
    {
      itemImageSrc: '/img/destacado-2.webp',
      thumbnailImageSrc: 'img/hero-img-1-thumb.webp',
      alt: 'Forum 2000',
      title: 'Diseño Retro con Toque Moderno'
    }
  ];

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];

}
