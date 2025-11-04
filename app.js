import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// === CONFIG FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyCoYxK3aGsq09ahCzVRZ66es_uT1mExO6Q",
  authDomain: "wapblog-6347d.firebaseapp.com",
  projectId: "wapblog-6347d",
  storageBucket: "wapblog-6347d.firebasestorage.app",
  messagingSenderId: "88848578293",
  appId: "1:88848578293:web:a34e495e3a1449c8cf77bc",
  measurementId: "G-H6GVBLR7F5"
};

// === INISIALISASI FIREBASE ===
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === VARIABEL GLOBAL ===
let isAdmin = false;
const PIN = "223344";

// === LOGIN PIN ===
document.getElementById("loginBtn").addEventListener("click", () => {
  const pin = prompt("Masukkan PIN untuk admin:");
  if (pin === PIN) {
    isAdmin = true;
    alert("✅ Login berhasil!");
    document.getElementById("postForm").classList.remove("hidden");
    tampilkanPostingan();
  } else {
    alert("❌ PIN salah!");
  }
});

// === KIRIM POSTINGAN ===
document.getElementById("kirim").addEventListener("click", async () => {
  if (!isAdmin) return alert("Masukkan PIN dulu bro!");
  const judul = document.getElementById("judul").value.trim();
  const isi = document.getElementById("isi").value.trim();
  const penulis = document.getElementById("penulis").value.trim();
  if (!judul || !isi || !penulis) {
    return alert("Isi semua kolom dulu bro!");
  }

  await addDoc(collection(db, "posting"), {
    judul,
    isi,
    penulis,
    waktu: new Date().toLocaleString("id-ID")
  });

  alert("✅ Postingan terkirim!");
  document.getElementById("judul").value = "";
  document.getElementById("isi").value = "";
  document.getElementById("penulis").value = "";
  tampilkanPostingan();
});

// === TAMPILKAN POSTINGAN ===
async function tampilkanPostingan() {
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "<p>Memuat...</p>";
  const querySnapshot = await getDocs(collection(db, "posting"));
  postsDiv.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const ringkas = data.isi.length > 120 ? data.isi.substring(0, 120) + "..." : data.isi;

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h3>${data.judul}</h3>
      <div class="meta">✍️ ${data.penulis} — ${data.waktu}</div>
      <p class="preview">${ringkas}</p>
      <button class="bacaBtn">Baca Selengkapnya</button>
      ${isAdmin ? `
        <div class="adminControls">
          <button class="editBtn">Edit</button>
          <button class="hapusBtn">Hapus</button>
        </div>` : ""}
    `;

    // === EVENT TOMBOL ===
    div.querySelector(".bacaBtn").addEventListener("click", () => {
      bukaModal(data.judul, data.isi);
    });

    if (isAdmin) {
      div.querySelector(".hapusBtn").addEventListener("click", async () => {
        if (confirm("Yakin hapus postingan ini?")) {
          await deleteDoc(doc(db, "posting", docSnap.id));
          alert("🗑️ Dihapus");
          tampilkanPostingan();
        }
      });

      div.querySelector(".editBtn").addEventListener("click", async () => {
        const baru = prompt("Edit isi postingan:", data.isi);
        if (baru && baru !== data.isi) {
          await updateDoc(doc(db, "posting", docSnap.id), { isi: baru });
          alert("✏️ Postingan diperbarui!");
          tampilkanPostingan();
        }
      });
    }

    postsDiv.appendChild(div);
  });
}

// === MODAL ===
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
const btnTutup = document.getElementById("tutupModal");

function bukaModal(judul, isi) {
  document.getElementById("modalJudul").innerText = judul;
  document.getElementById("modalIsi").innerText = isi;
  modal.classList.remove("hidden");
}

btnTutup.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) modal.classList.add("hidden");
});

// === MULAI ===
tampilkanPostingan();