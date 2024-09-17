import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('favorite')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['tv', 'movie'] })
  mediaType: 'tv' | 'movie';

  @Column({ type: 'varchar', length: 255 })
  mediaId: string;

  @Column({ type: 'varchar', length: 255 })
  mediaTitle: string;

  @Column({ type: 'varchar', length: 255 })
  mediaPoster: string;

  @Column({ type: 'float', nullable: false })
  mediaRate: number;
}
