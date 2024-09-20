import { Room } from 'src/modules/room/entities/room.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('ticket')
export class Ticket {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Room, (room) => room.tickets)
  @JoinColumn({ name: 'room_id' })
  roomId: string;

  @Column({ nullable: false })
  checkInDate: Date;

  @Column({ nullable: false })
  checkOutDate: Date;

  @Column({
    type: 'enum',
    enum: ['Cash ', 'Bank Transfer', 'Gift Card'],
    default: null,
    nullable: true,
  })
  paymentMethods: string;

  @Column({
    type: 'enum',
    enum: ['pending ', 'done', 'reject'],
    default: null,
    nullable: true,
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
