import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, JobSeekerProfile, UserRole } from '@/types';
import { currentUser, currentAdmin, users, jobSeekers } from '@/data/dummyData';

interface AuthContextType {
  user: User | JobSeekerProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<JobSeekerProfile>) => void;
  switchUser: (role: UserRole) => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | JobSeekerProfile | null>(null);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    // Check admin users
    const adminUser = users.find((u) => u.email === email);
    if (adminUser) {
      setUser(adminUser);
      return true;
    }
    
    // Check job seekers
    const jobSeeker = jobSeekers.find((u) => u.email === email);
    if (jobSeeker) {
      setUser(jobSeeker);
      return true;
    }
    
    // For demo, allow any email to login as job seeker
    setUser({ ...currentUser, email, name: email.split('@')[0] });
    return true;
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    const newUser: JobSeekerProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.name,
      role: 'job_seeker',
      skills: [],
      experience: '',
      createdAt: new Date().toISOString(),
    };
    
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((data: Partial<JobSeekerProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      return { ...prev, ...data };
    });
  }, []);

  // For demo purposes - switch between different user roles
  const switchUser = useCallback((role: UserRole) => {
    if (role === 'job_seeker') {
      setUser(currentUser);
    } else if (role === 'super_admin') {
      setUser(currentAdmin);
    } else {
      setUser(users.find((u) => u.role === 'stack_admin') || null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        switchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
