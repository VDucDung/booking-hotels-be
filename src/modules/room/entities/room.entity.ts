import { Ticket } from 'src/modules/tickets/entities/ticket.entity';
import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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

  @Column({ type: 'text', array: true })
  images: string[];

  @Column({
    type: 'enum',
    enum: ['1', '2', '3', '4', '5'],
    default: null,
    nullable: true,
  })
  typeRoom: string;

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

  @OneToMany(() => Ticket, (ticket) => ticket.roomId)
  tickets: Ticket[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;
}
