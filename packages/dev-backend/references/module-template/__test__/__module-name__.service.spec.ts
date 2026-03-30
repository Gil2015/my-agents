import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { __MODULE_NAME_PASCAL__Service } from '../__MODULE_NAME__.service';
import { __MODULE_NAME_PASCAL__Entity } from '../entities/__MODULE_NAME__.entity';

describe('__MODULE_NAME_PASCAL__Service', () => {
  let service: __MODULE_NAME_PASCAL__Service;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        __MODULE_NAME_PASCAL__Service,
        {
          provide: getRepositoryToken(__MODULE_NAME_PASCAL__Entity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<__MODULE_NAME_PASCAL__Service>(
      __MODULE_NAME_PASCAL__Service,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
