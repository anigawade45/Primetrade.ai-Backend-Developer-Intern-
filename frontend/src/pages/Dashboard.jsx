import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-toastify';
import { LogOut, Trash2, Plus, CheckCircle, Clock, Search } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchTasks = async (search = '') => {
    try {
      const { data } = await API.get(`/tasks${search ? `?search=${search}` : ''}`);
      // Access the tasks array from the new standardized response format
      setTasks(data.data.tasks || []);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await API.post('/tasks', { title, description });
      toast.success('Task added!');
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleDeleteTask = async (id) => {
    // Optimistic Update: Remove from UI immediately to prevent multiple clicks and 404s
    const originalTasks = [...tasks];
    setTasks(tasks.filter((task) => task._id !== id));

    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      // No need to fetchTasks() here as we already removed it optimistically
    } catch (err) {
      // Revert if API fails
      setTasks(originalTasks);
      toast.error('Failed to delete task');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    // Optimistic Update: Update status in UI immediately
    const originalTasks = [...tasks];
    setTasks(
      tasks.map((task) =>
        task._id === id ? { ...task, status } : task
      )
    );

    try {
      await API.put(`/tasks/${id}`, { status });
      toast.success('Status updated');
    } catch (err) {
      // Revert if API fails
      setTasks(originalTasks);
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <p className="text-gray-600">Manage your tasks here.</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition"
          >
            <LogOut size={20} className="mr-2" /> Logout
          </button>
        </header>

        <div className="bg-white p-6 rounded shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search size={24} className="mr-2 text-gray-600" /> Search Tasks
          </h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title or description..."
              className="w-full p-3 pl-10 border rounded focus:ring-2 focus:ring-blue-200 outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        <form onSubmit={handleAddTask} className="bg-white p-6 rounded shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Plus size={24} className="mr-2 text-blue-600" /> New Task
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              className="p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Description"
              className="p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Add Task
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4">
          {tasks.length === 0 ? (
            <p className="text-center text-gray-500">No tasks found. Add your first task!</p>
          ) : (
            tasks.map((task) => (
              <div key={task._id} className="bg-white p-4 rounded shadow-sm flex items-center justify-between border-l-4 border-blue-500">
                <div>
                  <h3 className="text-lg font-bold">{task.title}</h3>
                  <p className="text-gray-600">{task.description}</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded mt-2 inline-block ${
                    task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateStatus(task._id, 'completed')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <CheckCircle size={24} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
