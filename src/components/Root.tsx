import { Outlet } from 'react-router';
import { Navbar } from './Navbar';
import { Chatbot } from './Chatbot';

export function Root() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <Chatbot />
    </div>
  );
}
