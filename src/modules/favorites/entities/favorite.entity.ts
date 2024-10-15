import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

@Entity('favorite')
export class Favorite {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userId: User;

  @OneToOne(() => Hotel, (hotel) => hotel.favorite, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotelId: Hotel;
}
