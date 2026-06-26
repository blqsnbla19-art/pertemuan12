// App.js — Kode Utuh NoteKeeper (Tugas P12)
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Key konstanta untuk storage agar terhindar dari typo
const STORAGE_KEY = '@notekeeper_notes';
const COUNTER_KEY = '@notekeeper_total_dibuat';

export default function App() {
  // --- STATE MANAGEMENT ---
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [totalDibuat, setTotalDibuat] = useState(0);

  // --- PERSISTENCE LOGIC (ASYNCSTORAGE) ---

  // 1. Muat data saat aplikasi pertama kali dibuka (Mounting)
  useEffect(() => {
    async function muatDataAwal() {
      try {
        // Muat daftar catatan
        const jsonString = await AsyncStorage.getItem(STORAGE_KEY);
        if (jsonString != null) {
          setNotes(JSON.parse(jsonString));
        }

        // Muat statistik counter
        const nilaiCounter = await AsyncStorage.getItem(COUNTER_KEY);
        if (nilaiCounter != null) {
          setTotalDibuat(Number(nilaiCounter));
        }
      } catch (e) {
        console.log('Gagal memuat data dari storage:', e);
      }
    }

    muatDataAwal();
  }, []);

  // 2. Helper untuk menyimpan array catatan ke storage
  async function simpanKeStorage(notesArray) {
    try {
      const jsonString = JSON.stringify(notesArray);
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
    } catch (e) {
      console.log('Gagal menyimpan catatan:', e);
    }
  }

  // --- CRUD OPERATIONS ---

  // CREATE: Tambah Catatan Baru
  async function tambahCatatan() {
    if (input.trim() === '') return; // Validasi input kosong

    const catatanBaru = {
      id: Date.now().toString(), // ID unik berbasis timestamp
      teks: input,
      selesai: false,
    };

    // Update state dan langsung sinkronisasi ke storage
    const notesBaru = [catatanBaru, ...notes];
    setNotes(notesBaru);
    simpanKeStorage(notesBaru);

    // Update & simpan statistik counter (Bonus Langkah 10)
    const counterBaru = totalDibuat + 1;
    setTotalDibuat(counterBaru);
    await AsyncStorage.setItem(COUNTER_KEY, counterBaru.toString());

    setInput(''); // Reset text input
  }

  // UPDATE: Toggle Status Selesai (Coret Teks)
  function toggleSelesai(id) {
    const notesBaru = notes.map((item) =>
      item.id === id ? { ...item, selesai: !item.selesai } : item
    );
    setNotes(notesBaru);
    simpanKeStorage(notesBaru);
  }

  // DELETE: Hapus Catatan
  function hapusCatatan(id) {
    const notesBaru = notes.filter((item) => item.id !== id);
    setNotes(notesBaru);
    simpanKeStorage(notesBaru);
  }

  // --- UI RENDER ---
  return (
    <SafeAreaView style={styles.container}>
      {/* Header & Statistik */}
      <Text style={styles.title}>📝 NoteKeeper</Text>
      <Text style={styles.stat}>Total catatan dibuat: {totalDibuat}</Text>

      {/* Baris Input + Tombol Tambah */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Tulis catatan baru..."
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.addBtn} onPress={tambahCatatan}>
          <Text style={styles.addBtnText}>Tambah</Text>
        </TouchableOpacity>
      </View>

      {/* Daftar Catatan (FlatList) */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada catatan. Tambahkan satu! ✍️</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            {/* Tap pada area teks untuk menandai selesai */}
            <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleSelesai(item.id)}>
              <Text style={[styles.noteText, item.selesai && styles.noteSelesai]}>
                {item.selesai ? '✅ ' : '⬜ '}
                {item.teks}
              </Text>
            </TouchableOpacity>

            {/* Tombol Hapus */}
            <TouchableOpacity onPress={() => hapusCatatan(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// --- STYLING ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a2e0a',
    textAlign: 'center',
    marginBottom: 4,
  },
  stat: {
    textAlign: 'center',
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    color: '#333',
  },
  addBtn: {
    backgroundColor: '#00b894',
    borderRadius: 8,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00b894',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // shadow untuk Android
  },
  noteText: {
    fontSize: 15,
    color: '#0a2e0a',
    flex: 1,
    marginRight: 8,
  },
  noteSelesai: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  deleteBtn: {
    fontSize: 20,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 14,
  },
});