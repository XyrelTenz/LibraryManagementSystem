import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserRole } from '../shared/enums/role.enum';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const loginDto: LoginDto = { email: 'test@test.com', password: 'password' };
      const result: AuthEntity = { accessToken: 'token', user: {} as any };

      // Mock the return value
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login(loginDto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const registerDto: RegisterDto = {
        email: 'new@test.com',
        password: 'pass',
        fullName: 'Test User',
        role: UserRole.STUDENT
      };
      const result: AuthEntity = { accessToken: 'token', user: {} as any };

      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register(registerDto)).toEqual(result);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });
});
