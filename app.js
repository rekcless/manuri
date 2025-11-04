import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, orderBy, query }
  from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// === Konfigurasi Firebase kamu ===
const firebaseConfig = {
  apiKey: "AIzaSyCoYxK3aGsq09ahCzVRZ66es_uT1mExO6Q",
  authDomain: "wapblog-6347d.firebaseapp.com",
  projectId: "wapblog-6347d",
  storageBucket: "wapblog-6347d.firebasestorage.app",
  messagingSenderId: "88848578293",
  appId: "1:88848578293:web:fe1d65942e218cf5cf77bc",
  measurementId: "G-LY0KMBGM19"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variabel
let isAdmin = false;
const form = document.getElementById("formPost");
const daftarTulisan = document.getElementById("daftarTulisan");

// Tombol Admin
document.getElementById("adminBtn").addEventListener("click", () => {
  const pin = prompt("Masukkan PIN Admin:");
  if (pin === "223344") {
    alert("✅ Selamat datang, Admin!");
    isAdmin = true;
    form.style.display = "block";
    tampilkanTulisan();
  } else {
    alert("❌ PIN salah!");
  }
});

// Tambah postingan (hanya admin)
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!isAdmin) return alert("Hanya admin yang bisa menambah postingan!");

  const judul = document.getElementById("judul").value;
  const isi = document.getElementById("isi").value;

  await addDoc(collection(db, "postingan"), {
    judul,
    isi,
    waktu: serverTimestamp()
  });

  form.reset();
  tampilkanTulisan();
});

// Tampilkan postingan
async function tampilkanTulisan() {
  daftarTulisan.innerHTML = "<p>Memuat...</p>";

  const q = query(collection(db, "postingan"), orderBy("waktu", "desc"));
  const snapshot = await getDocs(q);

  daftarTulisan.innerHTML = "";
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const waktu = data.waktu?.toDate().toLocaleString("id-ID") || "-";

    let tombolHapus = "";
    if (isAdmin) {
      tombolHapus = `<button class="deleteBtn" data-id="${docSnap.id}">Hapus</button>`;
    }

    daftarTulisan.innerHTML += `
      <div class="post">
        ${tombolHapus}
        <h3>${data.judul}</h3>
        <p>${data.isi}</p>
        <small>${waktu}</small>
      </div>`;
  });

  // Event tombol hapus
  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (confirm("Yakin mau hapus postingan ini?")) {
        await deleteDoc(doc(db, "postingan", btn.dataset.id));
        tampilkanTulisan();
      }
    });
  });
}

tampilkanTulisan();