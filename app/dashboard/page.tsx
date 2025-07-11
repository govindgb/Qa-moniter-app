"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import {
  CheckCircle,
  XCircle,
  Users,
  Target,
  Activity,
  Filter,
} from "lucide-react";

const StatCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    data: dashboardData,
    stats,
    loading,
    error,
    getFilteredTestExecutions,
    getStatusDataForTag,
    getUniqueTags,
  } = useDashboard();

  const [selectedTag, setSelectedTag] = React.useState<string>("all");

  const uniqueTags = getUniqueTags();
  const statusData = getStatusDataForTag(selectedTag);

  const recentExecutions = dashboardData
    .filter((item) => item.latestExecution)
    .sort(
      (a:any, b:any) =>
        new Date(b.latestExecution.createdAt).getTime() -
        new Date(a.latestExecution.createdAt).getTime()
    )
    .slice(0, 5);

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "pass":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "pass":
        return "bg-green-100 text-green-800";
      case "fail":
        return "bg-red-100 text-red-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome Back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100">
          Here&apos;s an overview of your QA testing activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total UTC Cases
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  Unit test cases created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Test Executions
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalExecutions}
                </div>
                <p className="text-xs text-muted-foreground">Total test runs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Passed Tests
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.passedExecutions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully passed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Failed Tests
                </CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.failedExecutions}
                </div>
                <p className="text-xs text-muted-foreground">Tests failed</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution with Tag Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Test Status Distribution</CardTitle>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {selectedTag !== "all" && (
              <p className="text-sm text-muted-foreground">
                Showing results for tag:{" "}
                <Badge variant="outline">{selectedTag}</Badge>
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : statusData.every((entry) => entry.value === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500 text-sm">
                No test status data available
                {selectedTag !== "all" && (
                  <div className="text-center">
                    <p>for tag "{selectedTag}"</p>
                  </div>
                )}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData.filter((entry) => entry.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData
                      .filter((entry) => entry.value > 0)
                      .map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-3 border rounded-lg"
                    >
                      <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentExecutions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent test executions
                </p>
              ) : (
                recentExecutions.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    {/* Status Icon */}
                    {getStatusIcon(task?.latestExecution?.status)}

                    {/* Middle Column */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.unitTestLabel || "N/A"}
                      </p>
                      <p className="text-sm text-gray-500">
                        By {task.latestExecution?.testerName || "N/A"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags?.map((tag: any, index: any) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Right Status Label */}
                    <div className="text-right">
                      <Badge
                        className={`text-xs ${getStatusColor(
                          task.latestExecution?.status
                        )}`}
                      >
                        {task.latestExecution?.status?.toUpperCase() ?? "N/A"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-4 border rounded-lg"
                >
                  <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/create-task"
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Create UTC Case</h3>
                  <p className="text-sm text-gray-500">
                    Add a new unit test case
                  </p>
                </div>
              </a>

              <a
                href="/test-executions/create"
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Add New Executions</h3>
                  <p className="text-sm text-gray-500">
                    Run tests on existing cases
                  </p>
                </div>
              </a>

              <a
                href="/test-executions"
                className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">View Reports</h3>
                  <p className="text-sm text-gray-500">
                    Check execution reports
                  </p>
                </div>
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}