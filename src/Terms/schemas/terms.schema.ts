import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TermsDocument = Terms & Document;

@Schema({
  timestamps: true,
})
export class Terms {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;
}

export const TermsSchema = SchemaFactory.createForClass(Terms);
