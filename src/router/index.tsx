import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Welcome from '../pages/Welcome';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AIChat from '../pages/AIChat';
import ImageRecognition from '../pages/ImageRecognition';
import KnowledgeBase from '../pages/KnowledgeBase';
import ConsoleLayout from '../layouts/ConsoleLayout';
import AuthGuard from '../components/AuthGuard';
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Welcome /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      {
        path: '/dashboard',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <Dashboard />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: '/dashboard/ai-chat',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <AIChat />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: '/dashboard/image-recognition',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <ImageRecognition />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: '/dashboard/knowledge-base',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <KnowledgeBase />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
    ],
  },
]);
