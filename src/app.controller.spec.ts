import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('health', () => {
    it('should return health status', () => {
      const mockHealth = {
        status: 'ok',
        timestamp: '2023-01-01T00:00:00.000Z',
      };
      jest.spyOn(appService, 'getHealth').mockReturnValue(mockHealth);

      expect(appController.getHealth()).toBe(mockHealth);
    });
  });

  describe('info', () => {
    it('should return API info', () => {
      const mockInfo = {
        name: 'ERC-4337 Bundler',
        version: '0.0.1',
        endpoints: {
          rpc: '/rpc',
          health: '/health',
        },
      };
      jest.spyOn(appService, 'getInfo').mockReturnValue(mockInfo);

      expect(appController.getInfo()).toBe(mockInfo);
    });
  });
});
