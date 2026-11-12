import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  text: string;
  type: "text" | "link";
  createdAt: Date;
  title?: string;
  sharedText?: string;
  linkKey?: string;
}

const MessageSchema = new Schema<IMessage>(
  {
    text: { type: String, required: true },
    type: { type: String, enum: ["text", "link"], required: true },
    title: String,
    sharedText: String,
    linkKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model<IMessage>("Message", MessageSchema);
