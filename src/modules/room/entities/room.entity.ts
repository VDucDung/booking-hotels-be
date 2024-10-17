import { Ticket } from 'src/modules/tickets/entities/ticket.entity';
import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';
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

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false, default: 'default room' })
  roomName: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, default: 1 })
  capacity: number;

  @Column({ type: 'text', array: true })
  images: string[];

  @Column({
    type: 'text',
    array: true,
    nullable: true,
  })
  option?: string[];

  @Column({ nullable: false, default: 0 })
  price: number;

  @ManyToOne(() => TypeRoom, (typeRoom) => typeRoom.rooms)
  typeRoomId: TypeRoom;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partnerId: number;

  @OneToMany(() => Ticket, (ticket) => ticket.roomId)
  tickets: Ticket[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;
}
