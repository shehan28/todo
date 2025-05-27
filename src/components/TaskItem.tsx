import React from 'react';
import { format } from 'date-fns';
import { CheckCircle, Circle, Trash2, Edit, Calendar } from 'lucide-react';
import { Task } from '@/types';
import { cn, isOverdue } from '@/lib/utils';
import Button from '@/components/ui/Button';

interface TaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onComplete, onDelete, onEdit }) => {
  const isTaskOverdue = task.status === 'Open' && isOverdue(task.dueDate);
  
  return (
    <div className="bg-card rounded-lg shadow-sm border p-4 animate-slide-up hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            className="mt-1 flex-shrink-0 focus:outline-none"
            onClick={() => onComplete(task.id)}
            aria-label={task.status === 'Complete' ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {task.status === 'Complete' ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 
              className={cn(
                "font-medium text-card-foreground truncate",
                task.status === 'Complete' && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            
            {task.description && (
              <p 
                className={cn(
                  "text-sm text-muted-foreground mt-1 line-clamp-2",
                  task.status === 'Complete' && "line-through"
                )}
              >
                {task.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mt-2">
              <div 
                className={cn(
                  "flex items-center text-xs gap-1",
                  isTaskOverdue ? "text-destructive" : "text-muted-foreground"
                )}
              >
                <Calendar className="h-3 w-3" />
                <span>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  {isTaskOverdue && " (Overdue)"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-accent"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(task.id)}
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;