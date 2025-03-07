
import { User } from './user.model';

export type UserUpdateModel = Partial<User> & { id: number; };

