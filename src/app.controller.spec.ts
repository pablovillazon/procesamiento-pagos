/**
 * AppController test suite
 * 
 * Tests the AppController class and its methods to ensure correct behavior.
 * 
 * @remarks
 * This test suite initializes the NestJS testing module with the AppController
 * and AppService, then verifies that the getHello() method returns the expected
 * "Hello World Champions!" string.
 * 
 * @example
 * ```
 * npm run test
 * ```
 */
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World Champions!"', () => {
      expect(appController.getHello()).toBe('Hello World Champions!');
    });
  });
});
