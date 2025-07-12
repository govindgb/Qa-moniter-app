import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import { TestExecutionProvider } from '@/context/TestExecutionContext';
import { TagsProvider } from '@/context/TagsContext';
import AuthWrapper from '@/components/AuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QA Monitor Tool',
  description: 'Quality Assurance Task Management Tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TaskProvider>
            <TestExecutionProvider>
              <TagsProvider>
                <AuthWrapper>
                  {children}
                </AuthWrapper>
              </TagsProvider>
            </TestExecutionProvider>
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}