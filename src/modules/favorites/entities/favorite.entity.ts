import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';

@Entity('favorite')
export class Favorite {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  userId: number;

  @OneToMany(() => Hotel, (hotel) => hotel.favoriteId)
  hotels: number[];
}
