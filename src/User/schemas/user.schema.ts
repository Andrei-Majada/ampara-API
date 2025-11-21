/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

export type UserDocument = User & Document;

const algorithm = 'aes-256-ctr';

const encryptionKey = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_KEY || 'dev_key_change_me')
  .digest();

function encryptField(value: string): string {
  if (!value) return value;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(value, 'utf8'),
    cipher.final(),
  ]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptField(value: string): string {
  if (!value) return value;
  const [ivHex, encryptedHex] = value.split(':');
  if (!ivHex || !encryptedHex) return value;
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

function normalize(info: string): string {
  return info.trim().toLowerCase();
}

function generateHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

@Schema({
  timestamps: true,
  toJSON: { getters: true, virtuals: false },
  toObject: { getters: true, virtuals: false },
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({
    required: true,
    lowercase: true,
    unique: false,
    set: encryptField,
    get: decryptField,
  })
  email: string;

  @Prop({
    required: true,
    unique: true,
    index: true,
    select: false,
  })
  emailHash: string;

  @Prop({
    required: true,
    set: encryptField,
    get: decryptField,
  })
  phone: string;

  @Prop({ unique: true, index: true, select: false })
  phoneHash: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  description: string;

  // @Prop({
  //   required: true,
  //   set: encryptField,
  //   get: decryptField,
  // })
  // document: string;

  // @Prop({ unique: true, index: true, select: false })
  // documentHash: string;

  @Prop({ required: true })
  birth: Date;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop({
    required: true,
    enum: ['person', 'mediator', 'helper'],
  })
  profile: string;

  _id: any;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified('email')) {
    const plainEmail = this.email;
    this.emailHash = generateHash(plainEmail);
  }

  next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
  const update: any = this.getUpdate() || {};

  if (update.email) {
    const normalized = normalize(update.email);
    update.email = encryptField(normalized);
    update.emailHash = generateHash(normalized);
  }

  if (update.phone) {
    const normalized = normalize(update.phone);
    update.phone = encryptField(normalized);
    update.phoneHash = generateHash(normalized);
  }

  // if (update.document) {
  //   const normalized = normalize(update.document);
  //   update.document = encryptField(normalized);
  //   update.documentHash = generateHash(normalized);
  // }

  this.setUpdate(update);
  next();
});
