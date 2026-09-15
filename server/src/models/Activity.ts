import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  _id: Types.ObjectId;
  workspace: Types.ObjectId;
  project?: Types.ObjectId;
  task?: Types.ObjectId;
  actor: Types.ObjectId;
  action: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

ActivitySchema.index({ task: 1, createdAt: -1 });
ActivitySchema.index({ project: 1, createdAt: -1 });
ActivitySchema.index({ workspace: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
