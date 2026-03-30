import { Test, TestingModule } from '@nestjs/testing';
import { __MODULE_NAME_PASCAL__Controller } from '../__MODULE_NAME__.controller';
import { __MODULE_NAME_PASCAL__Service } from '../__MODULE_NAME__.service';

describe('__MODULE_NAME_PASCAL__Controller', () => {
  let controller: __MODULE_NAME_PASCAL__Controller;
  let service: __MODULE_NAME_PASCAL__Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [__MODULE_NAME_PASCAL__Controller],
      providers: [
        {
          provide: __MODULE_NAME_PASCAL__Service,
          useValue: {
            create: jest.fn(),
            queryList: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<__MODULE_NAME_PASCAL__Controller>(
      __MODULE_NAME_PASCAL__Controller,
    );
    service = module.get<__MODULE_NAME_PASCAL__Service>(
      __MODULE_NAME_PASCAL__Service,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
