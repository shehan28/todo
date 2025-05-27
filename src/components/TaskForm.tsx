import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Task } from '@/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

interface FormValues {
  title: string;
  description: string;
  dueDate: string;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate 
        ? new Date(task.dueDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    await onSubmit({
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg border max-w-md w-full p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              placeholder="Task title"
              {...register('title', {
                required: 'Title is required',
                maxLength: {
                  value: 100,
                  message: 'Title cannot exceed 100 characters',
                },
              })}
              error={errors.title?.message}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Task description"
              {...register('description')}
              error={errors.description?.message}
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
              Due Date
            </label>
            <Input
              id="dueDate"
              type="date"
              {...register('dueDate', {
                required: 'Due date is required',
              })}
              error={errors.dueDate?.message}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {task ? 'Update Task' : 'Add Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;