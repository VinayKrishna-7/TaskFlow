import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { ITask, TaskStatus } from '../../types';
import { api } from '../../lib/axios';
import { getSocket } from '../../lib/socket';

interface KanbanBoardProps {
  tasks: ITask[];
  onTaskClick: (task: ITask) => void;
  onAddTask: (status: TaskStatus) => void;
  projectId: string;
}

const COLUMNS: { status: TaskStatus; title: string }[] = [
  { status: 'TODO', title: 'To Do' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'IN_REVIEW', title: 'In Review' },
  { status: 'COMPLETED', title: 'Completed' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks: initialTasks,
  onTaskClick,
  onAddTask,
  projectId,
}) => {
  const [tasks, setTasks] = useState<ITask[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<ITask | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Real-time socket sync
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit('join:project', projectId);

      const handleTaskMoved = (movedTask: ITask) => {
        setTasks((prev) =>
          prev.map((t) => (t._id === movedTask._id ? { ...t, ...movedTask } : t))
        );
      };

      const handleTaskCreated = (newTask: ITask) => {
        setTasks((prev) => {
          if (prev.some((t) => t._id === newTask._id)) return prev;
          return [...prev, newTask];
        });
      };

      const handleTaskDeleted = ({ taskId }: { taskId: string }) => {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      };

      socket.on('task:moved', handleTaskMoved);
      socket.on('task:created', handleTaskCreated);
      socket.on('task:deleted', handleTaskDeleted);

      return () => {
        socket.off('task:moved', handleTaskMoved);
        socket.off('task:created', handleTaskCreated);
        socket.off('task:deleted', handleTaskDeleted);
        socket.emit('leave:project', projectId);
      };
    }
  }, [projectId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceTask = tasks.find((t) => t._id === activeId);
    if (!sourceTask) return;

    // Check if dropped onto a column directly or onto another task
    let targetStatus: TaskStatus = sourceTask.status;
    const isOverAColumn = COLUMNS.some((c) => c.status === overId);

    if (isOverAColumn) {
      targetStatus = overId as TaskStatus;
    } else {
      const targetTask = tasks.find((t) => t._id === overId);
      if (targetTask) targetStatus = targetTask.status;
    }

    const currentColumnTasks = tasks
      .filter((t) => t.status === targetStatus && t._id !== activeId)
      .sort((a, b) => a.position - b.position);

    let newPosition = 65535;
    if (isOverAColumn) {
      if (currentColumnTasks.length > 0) {
        newPosition = currentColumnTasks[currentColumnTasks.length - 1].position + 65535;
      }
    } else {
      const overIndex = currentColumnTasks.findIndex((t) => t._id === overId);
      if (overIndex === 0) {
        newPosition = currentColumnTasks[0].position / 2;
      } else if (overIndex === currentColumnTasks.length - 1) {
        newPosition = currentColumnTasks[overIndex].position + 65535;
      } else if (overIndex > 0) {
        newPosition =
          (currentColumnTasks[overIndex - 1].position + currentColumnTasks[overIndex].position) / 2;
      }
    }

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t._id === activeId ? { ...t, status: targetStatus, position: newPosition } : t
      )
    );

    // Call API
    try {
      await api.put(`/tasks/${activeId}/move`, {
        status: targetStatus,
        position: newPosition,
      });
    } catch (err) {
      console.error('Failed to move task, rolling back:', err);
      setTasks(previousTasks);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-6 h-full items-start scrollbar-thin">
        {COLUMNS.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.status)
            .sort((a, b) => a.position - b.position);
          return (
            <KanbanColumn
              key={col.status}
              status={col.status}
              title={col.title}
              tasks={colTasks}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl transition-transform pointer-events-none opacity-95">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};