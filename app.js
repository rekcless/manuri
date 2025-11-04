import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* =========================
   CONFIG FIREBASE (pakai config kamu)
   ========================= */
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

/* =========================
   GLOBALS & UI refs
   ========================= */
const PIN = "223344";
let isAdmin = false;

const loginBtn = document.getElementById("loginBtn");
const postForm = document.getElementById("postForm");
const judulIn = document.getElementById("judul");
const thumbIn = document.getElementById("thumbnail");
const isiIn = document.getElementById("isi");
const penulisIn = document.getElementById("penulis");
const kirimBtn = document.getElementById("kirim");
const batalBtn = document.getElementById("batal");

const postsDiv = document.getElementById("posts");
const paginationDiv = document.getElementById("pagination");

/* ============= Pagination settings =============
   5 posts per page, newest first
   We'll fetch all docs ordered by waktu desc then paginate client-side.
   This is fine for small-medium projects. If DB grows huge, switch to Firestore cursors.
================================================= */
const PER_PAGE = 5;
let allPosts = []; // will hold {id, data}
let currentPage = 1;

/* =========================
   HELPERS
   ========================= */
function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function formatTime(ts) {
  // ts may be Firestore Timestamp or string
  try {
    if (!ts) return "-";
    if (ts.toDate) return ts.toDate().toLocaleString("id-ID");
    return String(ts);
  } catch {
    return String(ts);
  }
}

/* =========================
   AUTH (PIN)
   ========================= */
loginBtn.addEventListener("click", () => {
  const pin = prompt("Masukkan PIN admin:");
  if (pin === PIN) {
    isAdmin = true;
    postForm.classList.remove("hidden");
    loginBtn.innerText = "🔓 Admin (ON)";
    loginBtn.disabled = true;
    loadAllPosts(); // reload as admin shows edit/hapus
    alert("✅ Admin mode aktif");
  } else {
    alert("❌ PIN salah");
  }
});

/* =========================
   CREATE POST
   ========================= */
kirimBtn.addEventListener("click", async () => {
  if (!isAdmin) return alert("Masuk admin dulu bro (PIN).");
  const judul = judulIn.value.trim();
  const isi = isiIn.value.trim();
  const penulis = penulisIn.value.trim();
  const thumb = thumbIn.value.trim();

  if (!judul || !isi || !penulis) return alert("Isi semua kolom (judul, isi, penulis).");

  try {
    await addDoc(collection(db, "posting"), {
      judul,
      isi,
      penulis,
      thumbnail: thumb || null,
      waktu: serverTimestamp()
    });
    // reset
    judulIn.value = "";
    isiIn.value = "";
    penulisIn.value = "";
    thumbIn.value = "";
    alert("✅ Post terkirim");
    await loadAllPosts();
    goToPage(1); // show newest
  } catch (e) {
    console.error(e);
    alert("❌ Gagal kirim ke Firestore");
  }
});

batalBtn.addEventListener("click", () => {
  judulIn.value = ""; thumbIn.value = ""; isiIn.value = ""; penulisIn.value = "";
});

/* =========================
   LOAD ALL POSTS (ordered newest first)
   ========================= */
async function loadAllPosts() {
  postsDiv.innerHTML = "<p>Memuat...</p>";
  try {
    // order by waktu desc; if waktu missing, fallback handled later
    const q = query(collection(db, "posting"), orderBy("waktu", "desc"));
    const snap = await getDocs(q);
    allPosts = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    // if any item has null waktu (very new items may have serverTimestamp pending),
    // we sort by waktu presence (serverTimestamp may be null until server writes - but usually available)
    allPosts.sort((a,b) => {
      const ta = a.data.waktu && a.data.waktu.toDate ? a.data.waktu.toDate().getTime() : 0;
      const tb = b.data.waktu && b.data.waktu.toDate ? b.data.waktu.toDate().getTime() : 0;
      return tb - ta;
    });
    renderPageNumbers();
    renderPostsForPage(currentPage);
  } catch (e) {
    console.error(e);
    postsDiv.innerHTML = "<p>Gagal memuat postingan.</p>";
  }
}

/* =========================
   RENDER POSTS FOR PAGE
   ========================= */
function renderPostsForPage(page = 1) {
  postsDiv.innerHTML = "";
  const total = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  const start = (page - 1) * PER_PAGE;
  const slice = allPosts.slice(start, start + PER_PAGE);

  if (slice.length === 0) {
    postsDiv.innerHTML = "<p>Belum ada postingan.</p>";
    return;
  }

  slice.forEach(item => {
    const d = item.data;
    const title = escapeHtml(d.judul || "Tanpa Judul");
    const penulis = escapeHtml(d.penulis || "Anonim");
    const waktu = formatTime(d.waktu) || "-";
    const preview = escapeHtml((d.isi || "").slice(0, 200)) + ((d.isi && d.isi.length > 200) ? "..." : "");
    const thumbUrl = d.thumbnail || "";

    // build element
    const postEl = document.createElement("div");
    postEl.className = "post";

    const thumbHtml = thumbUrl ? `<img class="post-thumb" src="${escapeHtml(thumbUrl)}" alt="thumb"/>` : "";
    postEl.innerHTML = `
      ${thumbHtml}
      <div class="post-body">
        <h3>${title}</h3>
        <div class="meta">✍️ ${penulis} — ${waktu}</div>
        <p class="preview">${preview}</p>
        <div class="controls">
          <button class="read">Baca Selengkapnya</button>
          ${isAdmin ? `<button class="edit">Edit</button><button class="del">Hapus</button>` : ""}
        </div>
      </div>
    `;

    // events
    postEl.querySelector(".read").addEventListener("click", () => {
      bukaModal(d.judul, d.isi, d.penulis, d.waktu, d.thumbnail);
    });

    if (isAdmin) {
      postEl.querySelector(".del").addEventListener("click", async () => {
        if (!confirm("Yakin hapus postingan ini?")) return;
        try {
          await deleteDoc(doc(db, "posting", item.id));
          alert("🗑️ Dihapus");
          await loadAllPosts();
        } catch (e) {
          console.error(e); alert("Gagal hapus");
        }
      });

      postEl.querySelector(".edit").addEventListener("click", async () => {
        const newIsi = prompt("Edit isi postingan:", d.isi || "");
        if (newIsi === null) return; // cancel
        try {
          await updateDoc(doc(db, "posting", item.id), { isi: newIsi });
          alert("✏️ Diperbarui");
          await loadAllPosts();
        } catch (e) {
          console.error(e); alert("Gagal edit");
        }
      });
    }

    postsDiv.appendChild(postEl);
  });

  renderPageNumbers();
}

/* =========================
   PAGINATION UI
   ========================= */
function renderPageNumbers() {
  paginationDiv.innerHTML = "";
  const total = allPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  // show up to many pages; for many pages, you can enhance to show windowed numbers
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "pageNum" + (i === currentPage ? " active" : "");
    btn.innerText = i;
    btn.addEventListener("click", () => {
      currentPage = i;
      renderPostsForPage(i);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    paginationDiv.appendChild(btn);
  }
}

/* =========================
   MODAL
   ========================= */
const modal = document.getElementById("modal");
const modalContent = document.querySelector(".modal-content");
const modalThumb = document.getElementById("modalThumb");
const modalJudul = document.getElementById("modalJudul");
const modalIsi = document.getElementById("modalIsi");
const modalMeta = document.getElementById("modalMeta");
const tutupModal = document.getElementById("tutupModal");

function bukaModal(judul, isi, penulis, waktu, thumb) {
  modalJudul.innerText = judul || "";
  modalMeta.innerText = `✍️ ${penulis || "Anonim"} — ${formatTime(waktu)}`;
  modalIsi.innerText = isi || "";
  if (thumb) {
    modalThumb.src = thumb;
    modalThumb.classList.remove("hidden");
  } else {
    modalThumb.classList.add("hidden");
  }
  modal.classList.remove("hidden");
}

tutupModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (!modalContent.contains(e.target)) modal.classList.add("hidden");
});

/* =========================
   START
   ========================= */
loadAllPosts();