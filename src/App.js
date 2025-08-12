import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import UploadHighValue from './pages/UploadHighValue';
import UploadPriority from './pages/UploadPriority';
import Login from './pages/Login'; // New login page

export default function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes inside Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/upload-high-value" element={<UploadHighValue />} />
        <Route path="/upload-priority" element={<UploadPriority />} />
      </Route>
    </Routes>
  );
}
