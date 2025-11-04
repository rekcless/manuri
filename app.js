import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoYxK3aGsq09ahCzVRZ66es_uT1mExO6Q",
  authDomain: "wapblog-6347d.firebaseapp.com",
  projectId: "wapblog-6347d",
  storageBucket: "wapblog-6347d.firebasestorage.app",
  messagingSenderId: "88848578293",
  appId: "1:88848578293:web:a34e495e3a1449c8cf77bc",
  measurementId: "G-H6GVBLR7F5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let isAdmin = false;

// 🔑 Tombol admin
document.getElementById("adminBtn").addEventListener("click", () => {
  const pin = prompt("Masukkan PIN Admin:");
  if (pin === "223344") {
    isAdmin = true;
    alert("✅ Mode Admin aktif!");
    tampilkanPostingan();
  } else {
    alert("❌ PIN salah!");
  }
});

// ✍️ Kirim postingan baru
document.getElementById("kirim").addEventListener("click", async () => {
  const judul = document.getElementById("judul").value.trim();
  const isi = document.getElementById("isi").value.trim();
  if (!judul || !isi) {
    alert("Isi judul dan isi postingan dulu bro!");
    return;
  }

  try {
    await addDoc(collection(db, "posting"), {
      judul,
      isi,
      waktu: new Date().toLocaleString("id-ID")
    });
    alert("✅ Postingan berhasil dikirim!");
    document.getElementById("judul").value = "";
    document.getElementById("isi").value = "";
    tampilkanPostingan();
  } catch (e) {
    alert("❌ Gagal kirim ke Firestore!");
    console.error(e);
  }
});

// 📜 Tampilkan semua postingan
async function tampilkanPostingan() {
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "<p>Memuat...</p>";
  const querySnapshot = await getDocs(collection(db, "posting"));
  postsDiv.innerHTML = "";
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h3>${data.judul}</h3>
      <p>${data.isi}</p>
      <small>${data.waktu}</small>
      ${isAdmin ? `
        <div class="adminControls">
          <button onclick="hapusPosting('${docSnap.id}')">Hapus</button>
        </div>` : ""}
    `;
    postsDiv.appendChild(div);
  });
}

// 🗑️ Hapus postingan (khusus admin)
window.hapusPosting = async (id) => {
  if (!isAdmin) return alert("Hanya admin yang bisa hapus!");
  if (confirm("Yakin mau hapus postingan ini?")) {
    await deleteDoc(doc(db, "posting", id));
    alert("🗑️ Postingan dihapus");
    tampilkanPostingan();
  }
};

// 🔄 Jalankan saat pertama kali load
tampilkanPostingan();
