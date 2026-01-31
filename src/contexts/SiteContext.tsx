import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SiteSettings, TechStack, Job, Application, AdminInvite } from '@/types';
import {
  siteSettings as initialSettings,
  techStacks as initialStacks,
  jobs as initialJobs,
  applications as initialApplications,
  adminInvites as initialInvites,
} from '@/data/dummyData';

interface SiteContextType {
  settings: SiteSettings;
  updateSettings: (data: Partial<SiteSettings>) => void;
  
  stacks: TechStack[];
  addStack: (stack: Omit<TechStack, 'id' | 'createdAt' | 'jobCount'>) => void;
  updateStack: (id: string, data: Partial<TechStack>) => void;
  deleteStack: (id: string) => void;
  
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'applicantCount'>) => void;
  updateJob: (id: string, data: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  
  applications: Application[];
  addApplication: (app: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  
  invites: AdminInvite[];
  addInvite: (invite: Omit<AdminInvite, 'id' | 'invitedAt' | 'expiresAt' | 'status'>) => void;
  updateInvite: (id: string, data: Partial<AdminInvite>) => void;
  deleteInvite: (id: string) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [stacks, setStacks] = useState<TechStack[]>(initialStacks);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [invites, setInvites] = useState<AdminInvite[]>(initialInvites);

  // Settings
  const updateSettings = useCallback((data: Partial<SiteSettings>) => {
    setSettings((prev) => ({ ...prev, ...data }));
  }, []);

  // Stacks
  const addStack = useCallback((stack: Omit<TechStack, 'id' | 'createdAt' | 'jobCount'>) => {
    const newStack: TechStack = {
      ...stack,
      id: `stack-${Date.now()}`,
      createdAt: new Date().toISOString(),
      jobCount: 0,
    };
    setStacks((prev) => [...prev, newStack]);
  }, []);

  const updateStack = useCallback((id: string, data: Partial<TechStack>) => {
    setStacks((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const deleteStack = useCallback((id: string) => {
    setStacks((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Jobs
  const addJob = useCallback((job: Omit<Job, 'id' | 'createdAt' | 'applicantCount'>) => {
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      applicantCount: 0,
    };
    setJobs((prev) => [...prev, newJob]);
    setStacks((prev) =>
      prev.map((s) => (s.id === job.stackId ? { ...s, jobCount: s.jobCount + 1 } : s))
    );
  }, []);

  const updateJob = useCallback((id: string, data: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...data } : j)));
  }, []);

  const deleteJob = useCallback((id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      setStacks((prev) =>
        prev.map((s) => (s.id === job.stackId ? { ...s, jobCount: Math.max(0, s.jobCount - 1) } : s))
      );
    }
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }, [jobs]);

  // Applications
  const addApplication = useCallback((app: Omit<Application, 'id' | 'appliedAt' | 'updatedAt'>) => {
    const newApp: Application = {
      ...app,
      id: `app-${Date.now()}`,
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) => [...prev, newApp]);
    setJobs((prev) =>
      prev.map((j) => (j.id === app.jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j))
    );
  }, []);

  const updateApplication = useCallback((id: string, data: Partial<Application>) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a
      )
    );
  }, []);

  // Invites
  const addInvite = useCallback(
    (invite: Omit<AdminInvite, 'id' | 'invitedAt' | 'expiresAt' | 'status'>) => {
      const now = new Date();
      const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const newInvite: AdminInvite = {
        ...invite,
        id: `invite-${Date.now()}`,
        invitedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        status: 'pending',
      };
      setInvites((prev) => [...prev, newInvite]);
    },
    []
  );

  const updateInvite = useCallback((id: string, data: Partial<AdminInvite>) => {
    setInvites((prev) => prev.map((i) => (i.id === id ? { ...i, ...data } : i)));
  }, []);

  const deleteInvite = useCallback((id: string) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <SiteContext.Provider
      value={{
        settings,
        updateSettings,
        stacks,
        addStack,
        updateStack,
        deleteStack,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        applications,
        addApplication,
        updateApplication,
        invites,
        addInvite,
        updateInvite,
        deleteInvite,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
