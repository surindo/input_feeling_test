import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://eysofbxczoaesihxpelb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5c29mYnhjem9hZXNpaHhwZWxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNjM4MjIsImV4cCI6MjA3ODYzOTgyMn0.X4Nec16yXjcrQtpUzAlkwJDgQKHKz8lqU4WF7kjp2KU"
);

/* ================= SELECT2 ================= */
$(document).ready(function () {
  $("#name").select2({ width: "100%" });
  $("#sesi").select2({ width: "100%" });
});

/* ================= ELEMENT ================= */
const form = document.getElementById("myForm");
const typeSelect = document.getElementById("type");
const nameSelect = document.getElementById("name");
const sesiSelect = document.getElementById("sesi");

// Dunlop
const ds = document.getElementById("ds");
const dc = document.getElementById("dc");
const dn = document.getElementById("dn");

// Kompetitor
const ks = document.getElementById("ks");
const kc = document.getElementById("kc");
const kn = document.getElementById("kn");

// Group
const stabilityGroup = document.querySelectorAll(".stability");
const comfortGroup = document.querySelectorAll(".comfort");
const noiseGroup = document.querySelectorAll(".noise");

const allInputs = [ds, dc, dn, ks, kc, kn];

/* ================= HELPER ================= */
function resetInputs() {
  allInputs.forEach(i => {
    i.value = "";
    i.required = false;
  });
}

/* ================= TYPE LOGIC ================= */
typeSelect.addEventListener("change", () => {
  const type = typeSelect.value;
  
  resetInputs();

  [...stabilityGroup, ...comfortGroup, ...noiseGroup]
    .forEach(g => g.style.display = "none");

  if (type === "Zenix") {
    stabilityGroup.forEach(g => g.style.display = "block");
    ds.required = true;
    ks.required = true;
  }

  if (type === "M6") {
    comfortGroup.forEach(g => g.style.display = "block");
    noiseGroup.forEach(g => g.style.display = "block");

    dc.required = true;
    dn.required = true;
    kc.required = true;
    kn.required = true;
  }
  
  loadExistingData();
});

/* ================= LOAD DATA ================= */
async function loadExistingData() {
  const type = typeSelect.value;
  const name = nameSelect.value;
  const sesi = sesiSelect.value;

  allInputs.forEach(i => {
    i.value = "";
  });

  if (!type || !name || !sesi) return;

  showLoading();

  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("type", type)
    .eq("name", name)
    .eq("sesi", sesi)
    .eq("tgl", new Date().toISOString().split("T")[0])
    .maybeSingle();

  if (error) {
    console.error(error);
    hideLoading();
    return;
  }

  if (!data) {
    hideLoading();
    return;
  }

  ds.value = data.dunlop_stability ?? "";
  dc.value = data.dunlop_comfort ?? "";
  dn.value = data.dunlop_noise ?? "";

  ks.value = data.komp_stability ?? "";
  kc.value = data.komp_comfort ?? "";
  kn.value = data.komp_noise ?? "";

  hideLoading();
}

$("#name").on("change", loadExistingData);
$("#sesi").on("change", loadExistingData);

/* ================= SUBMIT ================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const confirm = await Swal.fire({
    title: "Apakah data sudah benar?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya, simpan",
    cancelButtonText: "Batal"
  });

  if (!confirm.isConfirmed) return;

  showLoading();

  const payload = {
    type: typeSelect.value,
    name: nameSelect.value,
    sesi: sesiSelect.value,

    dunlop_stability: ds.value || null,
    dunlop_comfort: dc.value || null,
    dunlop_noise: dn.value || null,

    komp_stability: ks.value || null,
    komp_comfort: kc.value || null,
    komp_noise: kn.value || null
  };

  const { error } = await supabase
    .from("responses")
    .upsert([payload], {
      onConflict: "type,name,sesi,tgl"
    });

  hideLoading();

  if (error) {
    Swal.fire("Gagal", error.message, "error");
  } else {
    Swal.fire("Berhasil", "Data berhasil disimpan", "success");
    $("#name").val("").trigger("change");
  }
});

/* ================= LOADING ================= */
function showLoading() {
  document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

/* ================= DYNAMIC NAME OPTIONS ================= */

function getJakartaDate() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
}

// Tanggal mulai: 20 Jan 2026
const startDate = new Date("2026-01-20T00:00:00+07:00");
const today = getJakartaDate();

// Normalisasi jam
startDate.setHours(0, 0, 0, 0);
today.setHours(0, 0, 0, 0);

// Hitung selisih hari
const diffTime = today - startDate;
const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

// Huruf awal = C
const baseCharCode = "C".charCodeAt(0);

// Setiap hari lompat 4 huruf
const startCharCode = baseCharCode + (diffDays * 4);

// Ambil 4 group
const groups = [
  String.fromCharCode(startCharCode),
  String.fromCharCode(startCharCode + 1),
  String.fromCharCode(startCharCode + 2),
  String.fromCharCode(startCharCode + 3),
];

const select = document.getElementById("name");

select.innerHTML = "";
const defaultOption = document.createElement("option");
defaultOption.value = "";
defaultOption.textContent = "--";
defaultOption.selected = true;
defaultOption.disabled = true;
select.appendChild(defaultOption);

function createGroup(label) {
  const optgroup = document.createElement("optgroup");
  optgroup.label = `Group ${label}`;

  for (let i = 1; i <= 25; i++) {
    const option = document.createElement("option");
    option.value = `${label}${i}`;
    option.textContent = `${label}${i}`;
    optgroup.appendChild(option);
  }
  return optgroup;
}

// Tambahkan group ke select
groups.forEach(group => {
  select.appendChild(createGroup(group));
});


