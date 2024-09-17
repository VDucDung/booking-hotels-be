import { User } from 'src/modules/users/entities/user.entity';

export interface ILogin {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}
