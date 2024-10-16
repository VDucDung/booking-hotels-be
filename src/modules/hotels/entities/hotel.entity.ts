import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';
import { Favorite } from 'src/modules/favorites/entities/favorite.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TypeUtility } from 'src/modules/type_utility/entities/type_utility.entity';

@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  hotelName: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'text', array: true })
  images: string[];

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: User;

  @OneToMany(() => Review, (review) => review.hotelId)
  reviews?: Review[];

  @OneToMany(() => TypeRoom, (typeroom) => typeroom.hotel, { nullable: true })
  typeRooms: TypeRoom[];

  @OneToMany(() => Favorite, (favorite) => favorite.hotel)
  favorites: Favorite[];

  @Column({ nullable: true })
  avgRating?: number;

  @Column({ nullable: true })
  totalReviews?: number;

  @OneToMany(() => TypeUtility, (typeroom) => typeroom.hotel, {
    nullable: true,
  })
  typeUtility: TypeUtility[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;
}
