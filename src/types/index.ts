export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Open' | 'Complete';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}