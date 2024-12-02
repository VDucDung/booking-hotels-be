import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { Room } from 'src/modules/room/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';

@Entity('type_room')
export class TypeRoom {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Room, (room) => room.typeRoomId, { onDelete: 'CASCADE' })
  rooms: Room[];

  @ManyToOne(() => Hotel, (hotel) => hotel.typeRooms, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'partner_id' })
  partner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
