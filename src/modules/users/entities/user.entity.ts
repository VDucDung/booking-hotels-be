import { Exclude } from 'class-transformer';
import { USER_FORGOT_STATUS_ENUM } from 'src/enums/user-forgot-status.enum';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { USER_AVATAR_DEFAULT } from 'src/constants';
import { Role } from 'src/modules/roles/entities/role.entity';
import { Review } from 'src/modules/review/entities/review.entity';
import { Favorite } from 'src/modules/favorites/entities/favorite.entity';
import { Hotel } from 'src/modules/hotels/entities/hotel.entity';
import { Room } from 'src/modules/room/entities/room.entity';
import { TypeRoom } from 'src/modules/type_room/entities/type_room.entity';
import { AuthProvider } from 'src/modules/auth_provider/entities/auth_provider.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: true })
  fullname: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ unique: true })
  normalizedEmail: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Role, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  role?: Role;

  @Column({ nullable: true, default: USER_AVATAR_DEFAULT })
  avatar: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ default: false })
  isVerify: boolean;

  @Column({ nullable: true })
  verifyExpireAt: Date;

  @Column({
    type: 'enum',
    enum: USER_FORGOT_STATUS_ENUM,
    default: null,
    nullable: true,
  })
  forgotStatus: string;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: new Date() })
  lastActive: Date;

  @OneToMany(() => Review, (review) => review.userId)
  reviews: Review[];

  @OneToMany(() => Favorite, (favorite) => favorite.userId)
  favorites: Favorite[];

  @OneToMany(() => Hotel, (hotel) => hotel.partner)
  hotels: Hotel[];

  @OneToMany(() => Room, (room) => room.partnerId)
  rooms: Room[];

  @OneToMany(() => TypeRoom, (type_room) => type_room.partner)
  type_rooms: TypeRoom[];

  @OneToMany(() => AuthProvider, (authProvider) => authProvider.user, {
    cascade: true,
  })
  authProviders: AuthProvider[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted', default: false })
  deleted: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (
      this.password &&
      this.password !== '' &&
      !this.password.startsWith('$2a$')
    ) {
      this.password = await bcrypt.hash(this.password, 8);
    } else {
      this.password = this.password;
    }
  }

  async isPasswordMatch(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
