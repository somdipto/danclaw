import type { 
  User, Deployment, Message, DeploymentConfig, Activity 
} from '@danclaw/shared';

const BASE_URL = 'process.env.NEXT_PUBLIC_INSFORGE_URL || ''';
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

// Qwen 3.6 Plus - the ONLY allowed model
export const DEFAULT_MODEL = 'qwen/qwen-qwq-32b';

async function db<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE_URL}/api/database/${method}${path}`, {
    method: method === 'records' ? 'GET' : method === 'advanced' ? 'POST' : 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    ...(body && method !== 'records' ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`DB Error: ${res.status} ${res.statusText}`);
  return res.json() as T;
}

export class DanClawClient {
  async getUsers(): Promise<User[]> {
    return db<User[]>('records', '/users', { limit: 100 });
  }

  async getUser(userId: string): Promise<User> {
    const users = await db<User[]>('records', `/users`, { 
      limit: 1,
      filters: JSON.stringify({ id: userId })
    } as any);
    return users[0];
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const results = await db<User>('insert', 'users', {
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    } as any);
    return results;
  }

  async addUserDeployment(deployment: Deployment): Promise<Deployment> {
    return db<Deployment>('insert', 'deployments', deployment);
  }

  async getUserDeployments(userId: string): Promise<Deployment[]> {
    return db<Deployment[]>('records', '/deployments', {
      limit: 100,
      filters: JSON.stringify({ user_id: userId })
    } as any);
  }

  async updateDeployment(id: string, updates: Partial<Deployment>): Promise<Deployment> {
    return db<Deployment>('upsert', 'deployments', { 
      id, 
      ...updates, 
      updated_at: new Date().toISOString() 
    } as any);
  }

  async addMessage(message: Message): Promise<Message> {
    return db<Message>('insert', 'messages', message);
  }

  async getDeploymentMessages(deploymentId: string): Promise<Message[]> {
    return db<Message[]>('records', '/messages', {
      limit: 100,
      filters: JSON.stringify({ deployment_id: deploymentId })
    } as any);
  }

  async addActivity(activity: Activity): Promise<Activity> {
    return db<Activity>('insert', 'activity', activity);
  }

  async getUserActivities(userId: string): Promise<Activity[]> {
    return db<Activity[]>('records', '/activity', {
      limit: 50,
      filters: JSON.stringify({ user_id: userId })
    } as any);
  }
}

export default new DanClawClient();
