// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import TaskGarden from './pages/TaskGarden';

export default function App() {
  return (
    <>
      <Routes>
        {/* Default → redirect to /growops */}
        <Route path='/' element={<Navigate to='/growops' replace />} />

        {/* Main page */}
        <Route path='/growops' element={<TaskGarden />} />
      </Routes>
    </>
  );
}
