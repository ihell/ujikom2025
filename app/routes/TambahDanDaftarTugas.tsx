import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Task {
  id: string;
  nama: string;
  prioritas: string;
  status: boolean;
  tanggal: string;
}

/**
 * Komponen utama untuk menambah dan menampilkan daftar tugas.
 */
const TambahDanDaftarTugas = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
  
    const toggleDarkMode = () => {
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark', !isDarkMode);
    };

  /**
   * Mengambil data tugas dari Firestore saat komponen pertama kali dimuat.
   * Data yang diambil akan disimpan dalam state `tasks`.
   */
  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(db, 'toDoList');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksList);
      setLoading(false);
    };

    fetchTasks();
  }, []);

  /**
   * Menambahkan tugas baru ke Firestore dan memperbarui state `tasks`.
   * @param {string} nama - Nama tugas yang akan ditambahkan.
   * @param {string} prioritas - Prioritas tugas (Tinggi/Rendah).
   * @param {string} tanggal - Tanggal tugas.
   */
  const handleAddTask = async (nama: string, prioritas: string, tanggal: string) => {
    const newTask = { nama, prioritas, status: false, tanggal };
    const docRef = await addDoc(collection(db, 'toDoList'), newTask);
    setTasks([...tasks, { id: docRef.id, ...newTask }]);
  };

  /**
   * Menghapus tugas dari Firestore berdasarkan ID dan memperbarui state `tasks`.
   * @param {string} id - ID tugas yang akan dihapus.
   */
  const handleDeleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'toDoList', id));
    setTasks(tasks.filter(task => task.id !== id));
  };

  /**
   * Memperbarui tugas di Firestore berdasarkan ID dan memperbarui state `tasks`.
   * @param {string} id - ID tugas yang akan diperbarui.
   * @param {Partial<Task>} updatedTask - Objek tugas yang diperbarui.
   */
  const handleUpdateTask = async (id: string, updatedTask: Partial<Task>) => {
    await updateDoc(doc(db, 'toDoList', id), updatedTask);
    setTasks(tasks.map(task => (task.id === id ? { ...task, ...updatedTask } : task)));
  };

  /**
   * Memulai proses pengeditan tugas dengan mengatur tugas yang dipilih ke state `editingTask`.
   * @param {Task} task - Tugas yang akan diedit.
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  /**
   * Menyimpan perubahan tugas yang sedang diedit ke Firestore dan memperbarui state `tasks`.
   */
  const handleSaveEditTask = async () => {
    if (editingTask) {
      await handleUpdateTask(editingTask.id, editingTask);
      setEditingTask(null);
    }
  };

  /**
   * Menampilkan indikator loading jika data masih dalam proses pengambilan.
   */
  if (loading) {
    return (
      <div className="bg-black min-h-screen flex flex-col items-center justify-center">
        {/* Loader animasi titik-titik melingkar */}
        <div className="relative w-12 h-12">
          <div className="absolute w-full h-full border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
        </div>
        {/* Teks Loading */}
        <p className="text-orange-500 mt-4 text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  /**
   * Mengurutkan tugas berdasarkan prioritas (Tinggi di atas Rendah).
   */
  const sortedTasks = tasks.sort((a, b) => {
    if (a.prioritas === b.prioritas) return 0;
    return a.prioritas === 'Tinggi' ? -1 : 1;
  });

  /**
   * Memisahkan tugas yang sudah selesai dan belum selesai.
   */
  const completedTasks = sortedTasks.filter(task => task.status);
  const incompleteTasks = sortedTasks.filter(task => !task.status);

  return (
    <div className={`min-h-screen h-full flex flex-col ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-6 px-4 sm:px-8 shadow-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-center font-sans tracking-wide font-serif italic">
            Taskly
          </h1>
          <button
            onClick={toggleDarkMode}
            className="bg-gray-800 text-white px-4 py-2 rounded shadow-md hover:bg-gray-700 dark:bg-gray-200 dark:text-black dark:hover:bg-gray-300 flex items-center justify-center"
          >
            {isDarkMode ? (
              <span role="img" aria-label="Sun" className="text-yellow-500 text-xl">
                ☀️
              </span>
            ) : (
              <span role="img" aria-label="Moon" className="text-gray-500 text-xl">
                🌙
              </span>
            )}
          </button>
        </div>
        <p className="text-center text-sm mt-2 font-light">
          Kelola tugas Anda dengan mudah dan efisien
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-orange-500 mb-6 font-serif italic">Tambah Tugas</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const nama = (form.elements.namedItem('nama') as HTMLInputElement).value;
            const prioritas = (form.elements.namedItem('prioritas') as HTMLSelectElement).value;
            const tanggal = (form.elements.namedItem('tanggal') as HTMLInputElement).value;
            if (editingTask) {
              setEditingTask({ ...editingTask, nama, prioritas, tanggal });
              handleSaveEditTask();
            } else {
              handleAddTask(nama, prioritas, tanggal);
            }
            form.reset();
          }}
          className={`space-y-6 p-6 rounded-lg shadow-md ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-black'
          }`}
        >
           {/* Form fields */}
           <div>
            <label
              className={`block text-sm font-bold mb-2 ${
                isDarkMode ? 'text-orange-500' : 'text-gray-700'
              }`}
              htmlFor="nama"
            >
              Nama Tugas
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'border-orange-500 bg-black text-gray-300 focus:ring-orange-500'
                  : 'border-gray-300 bg-white text-black focus:ring-gray-500'
              }`}
              id="nama"
              type="text"
              placeholder="Nama Tugas"
              name="nama"
              defaultValue={editingTask ? editingTask.nama : ''}
              required
            />
          </div>
          <div>
            <label
              className={`block text-sm font-bold mb-2 ${
                isDarkMode ? 'text-orange-500' : 'text-gray-700'
              }`}
              htmlFor="prioritas"
            >
              Prioritas
            </label>
            <select
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'border-orange-500 bg-black text-gray-300 focus:ring-orange-500'
                  : 'border-gray-300 bg-white text-black focus:ring-gray-500'
              }`}
              id="prioritas"
              name="prioritas"
              defaultValue={editingTask ? editingTask.prioritas : ''}
              required
            >
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-bold mb-2 ${
                isDarkMode ? 'text-orange-500' : 'text-gray-700'
              }`}
              htmlFor="tanggal"
            >
              Tanggal
            </label>
            <input
              className={`shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 ${
                isDarkMode
                  ? 'border-orange-500 bg-black text-gray-300 focus:ring-orange-500'
                  : 'border-gray-300 bg-white text-black focus:ring-gray-500'
              }`}
              id="tanggal"
              type="date"
              placeholder="Tanggal"
              name="tanggal"
              defaultValue={editingTask ? editingTask.tanggal : ''}
              required
            />
          </div>
          <button
            className={`font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 w-full sm:w-auto ${
              isDarkMode
                ? 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500'
                : 'bg-orange-500 hover:bg-gray-900 text-white focus:ring-gray-500'
            }`}
            type="submit"
          >
            {editingTask ? 'Simpan Perubahan' : 'Tambah Tugas'}
          </button>
        </form>

         {/* Daftar Tugas */}
         <h2 className="text-3xl font-bold text-orange-500 mt-10 mb-6 font-serif italic">Daftar Tugas Belum Selesai</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white py-6 px-4 sm:px-8 shadow-lg">
              <tr>
                <th className="py-3 px-4 border-b text-white">Nama Tugas</th>
                <th className="py-3 px-4 border-b text-white">Prioritas</th>
                <th className="py-3 px-4 border-b text-white">Status</th>
                <th className="py-3 px-4 border-b text-white">Tanggal</th>
                <th className="py-3 px-4 border-b text-white">Aksi</th>
              </tr>
            </thead>
            <tbody
              className={`${
                isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-black'
              }`}
            >