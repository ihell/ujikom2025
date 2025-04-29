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