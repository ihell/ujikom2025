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