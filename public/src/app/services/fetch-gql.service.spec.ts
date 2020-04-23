import { TestBed } from '@angular/core/testing';

import { FetchGqlService } from './fetch-gql.service';

describe('FetchGqlService', () => {
  let service: FetchGqlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FetchGqlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
