import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/types';

const COLLECTION_NAME = 'tasks';

export const createTask = async (
  userId: string,
  taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> => {
  const taskRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...taskData,
    userId,
    status: 'Open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return taskRef.id;
};

export const updateTask = async (
  taskId: string,
  taskData: Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  const taskRef = doc(db, COLLECTION_NAME, taskId);
  await updateDoc(taskRef, {
    ...taskData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, COLLECTION_NAME, taskId);
  await deleteDoc(taskRef);
};

export const toggleTaskStatus = async (taskId: string, currentStatus: string): Promise<void> => {
  const taskRef = doc(db, COLLECTION_NAME, taskId);
  const newStatus = currentStatus === 'Open' ? 'Complete' : 'Open';
  
  await updateDoc(taskRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  });
};

export const getUserTasks = async (userId: string, status?: 'Open' | 'Complete'): Promise<Task[]> => {
  let tasksQuery;
  
  if (status) {
    tasksQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('dueDate', 'asc')
    );
  } else {
    tasksQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId),
      orderBy('dueDate', 'asc')
    );
  }
  
  const snapshot = await getDocs(tasksQuery);
  
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    
    // Convert Firestore Timestamps to ISO strings
    const createdAt = data.createdAt instanceof Timestamp 
      ? data.createdAt.toDate().toISOString() 
      : new Date().toISOString();
      
    const updatedAt = data.updatedAt instanceof Timestamp 
      ? data.updatedAt.toDate().toISOString() 
      : new Date().toISOString();
    
    return {
      id: doc.id,
      ...data,
      createdAt,
      updatedAt,
    } as Task;
  });
};