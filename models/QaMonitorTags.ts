import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  label: string;
  tagType: 'Feature' | 'Application' | 'BuildVersion' | 'Environment' | 'Device' | 'Sprints';
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema: Schema = new Schema({
  label: {
    type: String,
    required: [true, 'Tag label is required'],
    trim: true,
    minlength: [1, 'Tag label must be at least 1 character'],
    maxlength: [100, 'Tag label cannot exceed 100 characters'],
  },
  tagType: {
    type: [String],
    required: [true, 'Tag type is required'],
    enum: ['Feature', 'Application', 'BuildVersion', 'Environment', 'Device', 'Sprints'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Working on description cannot exceed 200 characters'],
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'QaMonitorUsers',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});


export default mongoose.models.QaMonitorTags || mongoose.model<ITag>('QaMonitorTags', TagSchema);