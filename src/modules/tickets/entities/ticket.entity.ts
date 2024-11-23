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

  @Column({ nullable: false })
  contactName: string;

  @Column({ nullable: false })
  contactEmail: string;

  @Column({ nullable: false })
  contactPhone: string;

  @Column({ nullable: true })
  guestFullName: string;

  @Column({ type: 'text', array: true })
  option: string[];

  @ManyToOne(() => Room, (room) => room.tickets)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ nullable: false })
  checkInDate: Date;

  @Column({ nullable: false })
  checkOutDate: Date;

  @Column({ nullable: false })
  checkInTime: string;

  @Column({ nullable: false })
  checkOutTime: string;

  @Column({
    type: 'enum',
    enum: ['cash', 'bank card'],
    default: null,
    nullable: true,
  })
  paymentMethods: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'unpaid'],
    default: 'pending',
    nullable: true,
  })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
