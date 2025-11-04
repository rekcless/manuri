import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc
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
const PIN = "223344";

document.getElementById("loginBtn").addEventListener("click", () => {
  const pin = prompt("Masukkan PIN untuk masuk:");
  if (pin === PIN) {
    isAdmin = true;
    alert("✅ Login berhasil!");
    document.getElementById("postForm").classList.remove("hidden");
    tampilkanPostingan();
  } else {
    alert("❌ PIN salah!");
  }
});

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

async function tampilkanPostingan() {
  const postsDiv = document.getElementById("posts");
  postsDiv.innerHTML = "<p>Memuat...</p>";
  const querySnapshot = await getDocs(collection(db, "posting"));
  postsDiv.innerHTML = "";

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "post";
    const ringkas = data.isi.length > 120 ? data.isi.substring(0, 120) + "..." : data.isi;
    div.innerHTML = `
      <h3>${data.judul}</h3>
      <div class="meta">✍️ ${data.penulis} — ${data.waktu}</div>
      <p class="preview">${ringkas}</p>
      <button onclick="bacaSelengkapnya('${encodeURIComponent(JSON.stringify(data))}')">Baca Selengkapnya</button>
      ${isAdmin ? `
        <div class="adminControls">
          <button onclick="editPosting('${docSnap.id}', '${data.judul}', '${data.isi.replace(/'/g, "\\'")}')">Edit</button>
          <button onclick="hapusPosting('${docSnap.id}')">Hapus</button>
        </div>` : ""}
    `;
    postsDiv.appendChild(div);
  });
}

window.hapusPosting = async (id) => {
  if (!isAdmin) return alert("Hanya admin!");
  if (confirm("Yakin hapus postingan ini?")) {
    await deleteDoc(doc(db, "posting", id));
    alert("🗑️ Dihapus");
    tampilkanPostingan();
  }
};

window.editPosting = async (id, judul, isi) => {
  if (!isAdmin) return;
  const baru = prompt("Edit isi postingan:", isi);
  if (baru && baru !== isi) {
    await updateDoc(doc(db, "posting", id), { isi: baru });
    alert("✏️ Postingan diperbarui!");
    tampilkanPostingan();
  }
};

window.bacaSelengkapnya = (dataString) => {
  const data = JSON.parse(decodeURIComponent(dataString));
  document.getElementById("modalJudul").innerText = data.judul;
  document.getElementById("modalIsi").innerText = data.isi;
  document.getElementById("modal").classList.remove("hidden");
};

document.getElementById("tutupModal").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

tampilkanPostingan();