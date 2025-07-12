import mongoose, { Schema, Document } from 'mongoose';

export interface ITestExecution extends Document {
  taskId: mongoose.Types.ObjectId;
  execId: string;
  status: 'pass' | 'fail';
  feedback: string;
  attachedImages?: string[];
  testerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const TestExecutionSchema: Schema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Task ID is required'],
  },
  execId: {
    type: String,
    required: [true, 'Test ID is required'],
    trim: true,
  },
  status: {
    type: String,
    enum: {
      values: ['pass', 'fail'],
      message: '{VALUE} is not a valid status. Use "pass" or "fail".',
    },
    lowercase: true,
    default: 'fail',
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
    trim: true,
  },
  attachedImages: [{
    type: String,
    trim: true,
  }],
  testerName: {
    type: String,
    required: [true, 'Tester name is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

// // Indexes
// TestExecutionSchema.index({ taskId: 1 });
// TestExecutionSchema.index({ execId: 1 });
// TestExecutionSchema.index({ status: 1 });
// TestExecutionSchema.index({ createdAt: -1 });

export default mongoose.models.TestExecution || mongoose.model<ITestExecution>('TestExecution', TestExecutionSchema);