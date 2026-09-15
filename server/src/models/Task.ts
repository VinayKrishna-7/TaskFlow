import mongoose, { Schema, Document, Types } from 'mongoose';
import { TaskPriority, TaskStatus, RecurrenceType } from '../types';

export interface ISubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface IAttachment {
  id: string;
  name: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface ITimeEntry {
  id: string;
  user: Types.ObjectId;
  description?: string;
  durationMinutes: number;
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
}

export interface ITask extends Document {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  workspace: Types.ObjectId;
  taskNumber: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: Types.ObjectId;
  reporter: Types.ObjectId;
  labels: string[];
  dueDate?: Date;
  startDate?: Date;
  estimatedHours: number;
  actualHours: number;
  position: number;
  subtasks: ISubtask[];
  attachments: IAttachment[];
  watchers: Types.ObjectId[];
  timeEntries: ITimeEntry[];
  recurrence: {
    type: RecurrenceType;
    interval: number;
    nextRunDate?: Date;
  };
  isArchived: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubtaskSchema = new Schema<ISubtask>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AttachmentSchema = new Schema<IAttachment>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    originalName: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TimeEntrySchema = new Schema<ITimeEntry>(
  {
    id: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, trim: true },
    durationMinutes: { type: Number, required: true, default: 0 },
    startTime: { type: Date },
    endTime: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITask>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    taskNumber: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'],
      default: 'TODO',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    labels: {
      type: [String],
      default: [],
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    startDate: {
      type: Date,
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: [0, 'Estimated hours cannot be negative'],
    },
    actualHours: {
      type: Number,
      default: 0,
      min: [0, 'Actual hours cannot be negative'],
    },
    position: {
      type: Number,
      default: 65535,
      index: true,
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    watchers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    timeEntries: {
      type: [TimeEntrySchema],
      default: [],
    },
    recurrence: {
      type: {
        type: String,
        enum: ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY'],
        default: 'NONE',
      },
      interval: { type: Number, default: 1 },
      nextRunDate: { type: Date },
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ project: 1, status: 1, position: 1 });
TaskSchema.index({ workspace: 1, assignee: 1, status: 1 });
TaskSchema.index({ title: 'text', description: 'text' });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
