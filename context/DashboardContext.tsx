"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DashboardData {
  _id: string;
  unitTestLabel: string;
  tags: string[];
  latestExecution?: {
    status: string;
    createdAt: string;
    testerName: string;
  };
}

interface DashboardStats {
  totalTasks: number;
  totalExecutions: number;
  passedExecutions: number;
  failedExecutions: number;
}

interface DashboardState {
  data: DashboardData[];
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

interface DashboardContextType extends DashboardState {
  fetchDashboardData: () => Promise<void>;
  getFilteredTestExecutions: (selectedTag: string) => DashboardData[];
  getStatusDataForTag: (selectedTag: string) => Array<{ name: string; value: number; color: string }>;
  getUniqueTags: () => string[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DashboardState>({
    data: [],
    stats: {
      totalTasks: 0,
      totalExecutions: 0,
      passedExecutions: 0,
      failedExecutions: 0,
    },
    loading: true,
    error: null,
  });

  const calculateStats = (data: DashboardData[]) => {
    const totalTasks = data.length;
    const totalExecutions = data.filter((d) => d.latestExecution).length;

    const statusCounts = data.reduce((acc, item) => {
      const status = item.latestExecution?.status;
      if (status) acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTasks,
      totalExecutions,
      passedExecutions: statusCounts.pass || 0,
      failedExecutions: statusCounts.fail || 0,
    };
  };

  const fetchDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const res = await fetch("/api/dashboard");
      const result = await res.json();

      if (result.success) {
        const stats = calculateStats(result.data);
        setState({
          data: result.data,
          stats,
          loading: false,
          error: null,
        });
      } else {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to fetch dashboard data",
      }));
    }
  };

  const getUniqueTags = () => {
    const tags = state.data.flatMap((item) => item.tags || []);
    return Array.from(new Set(tags));
  };

  const getFilteredTestExecutions = (selectedTag: string) => {
    const filtered = state.data.filter((item) => {
      if (!item.latestExecution) return false;
      if (selectedTag === "all") return true;
      return item.tags?.includes(selectedTag);
    });
    return filtered;
  };

  const getStatusDataForTag = (selectedTag: string) => {
    const filtered = getFilteredTestExecutions(selectedTag);
    const statusCounts = filtered.reduce((acc, item) => {
      const status = item.latestExecution?.status;
      if (status) acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: "Pass", value: statusCounts.pass || 0, color: "#10B981" },
      { name: "Fail", value: statusCounts.fail || 0, color: "#EF4444" },
    ];
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const contextValue: DashboardContextType = {
    ...state,
    fetchDashboardData,
    getFilteredTestExecutions,
    getStatusDataForTag,
    getUniqueTags,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}