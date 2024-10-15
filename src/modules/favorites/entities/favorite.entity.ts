import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('favorite')
export class Favorite {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Hotel, (hotel) => hotel.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
