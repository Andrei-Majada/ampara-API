import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RequestDocument = Request & Document;

@Schema({
  timestamps: true,
})
export class Request {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  userMessage: string;

  @Prop({
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'canceled'],
    default: 'pending',
  })
  status: string;

  @Prop({
    type: [
      {
        helperId: { type: Types.ObjectId, ref: 'User', required: true },
      },
    ],
    default: [],
  })
  helpers: {
    helperId: Types.ObjectId;
  }[];

  @Prop({
    type: [
      {
        helperId: { type: Types.ObjectId, ref: 'User', required: true },
      },
    ],
    default: [],
  })
  availableSupporters: {
    helperId: Types.ObjectId;
  }[];
}

export const RequestSchema = SchemaFactory.createForClass(Request);
