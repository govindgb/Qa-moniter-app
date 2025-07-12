export interface TestCase {
  testCase: string;
  passed: boolean;
  notes?: string;
}

export interface TestExecution {
  _id: string;
  taskId: {
    unitTestLabel: string;
    _id: string;
    tags: string[];
    description: string;
  };
  execId: string;
  testCases: {
    testCase: string;
    passed: boolean;
    notes: string;
    _id: string;
  }[];
  status: 'pass' | 'fail';
  feedback: string;
  attachedImages: string[];
  testerName: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateTestExecutionRequest {
  taskId: string;
  execId: string;
  testCases: TestCase[];
  status: 'pass' | 'fail';
  feedback: string;
  attachedImages?: string[];
  testerName: string;
}

export interface TestExecutionContextType {
  testExecutions: TestExecution[];
  loading: boolean;
  error: string | null;
  createTestExecution: (testExecution: CreateTestExecutionRequest) => Promise<void>;
  getTestExecutions: (filters?: any) => Promise<void>;
  updateTestExecution: (id: string, testExecution: CreateTestExecutionRequest) => Promise<void>;
  deleteTestExecution: (id: string) => Promise<void>;
  getTestExecutionById: (id: string) => Promise<TestExecution | null>;
  getTestExecutionsByTaskId: (taskId: string) => Promise<TestExecution[]>;
  uploadImages: (files: FileList) => Promise<string[]>;
}