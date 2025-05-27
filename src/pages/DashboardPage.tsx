import React, { useState, useEffect } from 'react';
import { Plus, CalendarDays, ListFilter, Loader2 } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Task } from '@/types';
import TaskItem from '@/components/TaskItem';
import TaskForm from '@/components/TaskForm';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getUserTasks,
} from '@/services/taskService';

const DashboardPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await getUserTasks(user.uid, 'Open');
      setTasks(fetchedTasks);
      setFilteredTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTasks(tasks);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(lowercaseQuery) ||
          task.description.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredTasks(filtered);
    }
  }, [searchQuery, tasks]);

  const handleAddTask = () => {
    setCurrentTask(undefined);
    setIsFormVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setIsFormVisible(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      await deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleToggleStatus = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await toggleTaskStatus(taskId, task.status);
      fetchTasks(); // Refresh tasks
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleFormSubmit = async (data: Partial<Task>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      if (currentTask) {
        // Update existing task
        await updateTask(currentTask.id, data);
      } else {
        // Create new task
        await createTask(user.uid, data as Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      }
      
      setIsFormVisible(false);
      fetchTasks(); // Refresh tasks
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setCurrentTask(undefined);
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your tasks efficiently
          </p>
        </div>
        <Button onClick={handleAddTask} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Add New Task
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <ListFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-muted/40 rounded-lg border border-dashed p-8 text-center">
          <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "No tasks match your search criteria."
              : "You haven't created any tasks yet. Add a new task to get started."}
          </p>
          {!searchQuery && (
            <Button onClick={handleAddTask} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleToggleStatus}
              onDelete={handleDeleteTask}
              onEdit={handleEditTask}
            />
          ))}
        </div>
      )}

      {isFormVisible && (
        <TaskForm
          task={currentTask}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default DashboardPage;