import { TestBed } from '@angular/core/testing';
import { ZapatillaService } from './zapatilla.service';



describe('ZapatillaService', () => {
  let service: ZapatillaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZapatillaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
