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