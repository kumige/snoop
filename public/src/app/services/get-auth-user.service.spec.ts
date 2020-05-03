import { TestBed } from '@angular/core/testing';

import { GetAuthUserService } from './get-auth-user.service';

describe('GetAuthUserService', () => {
  let service: GetAuthUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GetAuthUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
