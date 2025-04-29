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