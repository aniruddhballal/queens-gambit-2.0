import mongoose, { Schema, Document } from 'mongoose';

export interface IFileConversion extends Document {
  ipAddress: string;
  fileName: string;
  mode: 'encode' | 'decode';
  timestamp: Date;
}

const FileConversionSchema: Schema = new Schema({
  ipAddress: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  mode: {
    type: String,
    enum: ['encode', 'decode'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
FileConversionSchema.index({ ipAddress: 1, timestamp: -1 });

export default mongoose.model<IFileConversion>('FileConversion', FileConversionSchema);