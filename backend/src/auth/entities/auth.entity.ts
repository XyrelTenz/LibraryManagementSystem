import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../users/entities/user.entity';

export class AuthEntity {
  constructor(partial: Partial<AuthEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserEntity })
  user: UserEntity;
}
