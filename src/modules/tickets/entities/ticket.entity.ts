import { PaymentMethod, TicketStatus } from 'src/enums/ticket.enum';
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
    enum: PaymentMethod,
    default: null,
    nullable: true,
  })
  paymentMethods: string;

  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
    nullable: true,
  })
  status: string;

  @Column({ nullable: false, default: 0 })
  amount: number;

  @Column({ nullable: true })
  stripePaymentIntentId: string;

  @Column({ nullable: true })
  stripeTransferId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
