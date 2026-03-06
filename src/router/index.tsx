import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AIChat from '../pages/AIChat';
import ImageRecognition from '../pages/ImageRecognition';
import KnowledgeBase from '../pages/KnowledgeBase';
import ConsoleLayout from '../layouts/ConsoleLayout';
import AuthGuard from '../components/AuthGuard';
import Profile from '../pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <AIChat />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'ai-chat',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <AIChat />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: 'image-recognition',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <ImageRecognition />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: 'knowledge-base',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <KnowledgeBase />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <ConsoleLayout>
              <Profile />
            </ConsoleLayout>
          </AuthGuard>
        ),
      },
    ],
  },
]);
