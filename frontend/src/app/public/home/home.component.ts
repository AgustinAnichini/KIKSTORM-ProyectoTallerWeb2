import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ShoeComponent } from '../shoe/shoe.component';
import { Zapatilla } from '../../../interfaces';
import { ZapatillaService } from '../../api/services/zapatilla/zapatilla.service';
import { error } from 'console';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';


@Component({
  selector: 'app-home',
  imports: [GalleriaModule, RouterLink, CardModule, ButtonModule, FooterComponent, ShoeComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers: [DialogService],
})
export class HomeComponent implements OnInit{

  sendIcon: string = '/img/iconSend.png'
  pagoIcon: string = '/img/iconPago.png' 
  segurityIcon: string = '/img/segurityIcon.png'
  hombre: string = '/img/hombre.webp'
  mujer: string = '/img/mujer.webp'
  ninio: string = '/img/ninio.webp'
  descatacado1: string = '/img/destacado-1.jpg'
  descatacado2: string = '/img/destacado-2.jpg'
  descatacado3: string = '/img/destacado-3.jpg'
  adidas: string = '/img/Adidas-Logo.png'
  nike: string = '/img/Logo-Nike.png'
  puma: string = '/img/Logo-Puma.png'
  fila: string = '/img/Logo-Fila.webp'
  slider: string = '/img/slider-promo.gif'
  zapatillaLimit: Zapatilla[] = []
  error = '';
  zapatillaService= inject(ZapatillaService)
  dialogService = inject(DialogService)
  private ref?: DynamicDialogRef;

  ngOnInit(): void {
    this.getZapatillasDestacadas()
  }

  getZapatillasDestacadas(){
    this.zapatillaService.getZapatillasLimit().subscribe({
      next: (data: Zapatilla[]) => {
        this.zapatillaLimit = data;
      },
      error: (err) => {
        this.error = 'Error al cargar las zapatillas';
        console.error(err);
      } 
    })
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
  

  // Galería 1 (primera)
  imagesFirstGallery: any[] = [
    {
      itemImageSrc: '/img/hero-img.webp',
      thumbnailImageSrc: 'img/hero-img-thumb.webp',
      alt: 'Zapatilla 1',
      title: 'Modelo Urbano 1'
    },
    {
      itemImageSrc: '/img/hero-img-1.webp',
      thumbnailImageSrc: 'img/hero-img-1-thumb.webp',
      alt: 'Zapatilla 2',
      title: 'Modelo Urbano 2'
    },
    {
      itemImageSrc: '/img/hero-img-3.webp',
      thumbnailImageSrc: 'img/hero-img-3-thumb.webp',
      alt: 'Zapatilla 3',
      title: 'Modelo Urbano 3'
    },
  ];

  // Galería 2 
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
