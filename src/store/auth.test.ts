import { describe, it, expect, beforeEach, vi } from 'vitest';
import { type User } from 'firebase/auth';
import { useAuthStore } from './auth';

vi.mock('localforage', () => ({
  setItem: vi.fn(),
  getItem: vi.fn(),
  removeItem: vi.fn(),
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset Zustand state before each test
    const { setUser, setLoading, logout } = useAuthStore.getState();
    setUser(null);
    setLoading(true);
    logout();
  });

  it('should initialize with correct default values', () => {
    const { user, isLoading } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(isLoading).toBe(true);
  });

  it('should set user correctly', () => {
    const mockUser = { uid: '123', email: 'test@example.com' } as unknown as User;
    useAuthStore.getState().setUser(mockUser);

    const { user } = useAuthStore.getState();
    expect(user).toEqual(mockUser);
  });

  it('should set loading correctly', () => {
    useAuthStore.getState().setLoading(false);

    const { isLoading } = useAuthStore.getState();
    expect(isLoading).toBe(false);
  });

  it('should logout and clear user', () => {
    const mockUser = { uid: '123', email: 'test@example.com' } as unknown as User;
    useAuthStore.getState().setUser(mockUser);

    useAuthStore.getState().logout();
    const { user } = useAuthStore.getState();

    expect(user).toBeNull();
  });
});
