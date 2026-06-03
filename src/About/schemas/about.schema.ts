import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AboutDocument = About & Document;

@Schema({
  timestamps: true,
})
export class About {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;
}

export const AboutSchema = SchemaFactory.createForClass(About);
