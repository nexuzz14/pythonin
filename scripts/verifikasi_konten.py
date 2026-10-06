#!/usr/bin/env python3
"""
verifikasi_konten.py — Verifikasi otomatis semua file konten Pythonin.

Memeriksa:
  1. Validitas JSON dan field wajib
  2. Materi (bab-N.json): eksekusi contoh_kode vs output_contoh
  3. Kuis (kuis-bab-N.json): opsi, jawaban_benar, distribusi, eksekusi kode soal
  4. Tantangan (tantangan-bab-N.json): eksekusi contoh_solusi vs output_diharapkan

Jalankan:
    python scripts/verifikasi_konten.py

Exit code 0 = semua lolos, 1 = ada kegagalan.
"""

import sys
import io
import json
import os
import subprocess
import tempfile

# ── Encoding aman untuk Windows ──────────────────────────────────────
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

CONTENT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "content")
MAX_BAB = 10  # scan bab-1 sampai bab-10
TIMEOUT = 5
PYTHON = sys.executable

# ── Pencatat hasil ───────────────────────────────────────────────────
passes = []
failures = []
infos = []


def log_pass(file, detail):
    passes.append((file, detail))


def log_fail(file, detail):
    failures.append((file, detail))


def log_info(file, detail):
    infos.append((file, detail))


# ── Utilitas ─────────────────────────────────────────────────────────
def normalize(text):
    """Hapus spasi di ujung tiap baris dan baris kosong di akhir."""
    lines = text.split("\n")
    lines = [l.rstrip() for l in lines]
    while lines and lines[-1] == "":
        lines.pop()
    return "\n".join(lines)


def run_code(code, label=""):
    """Jalankan kode Python di subprocess, kembalikan (stdout, stderr, returncode)."""
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=".py", prefix="pyv_")
    try:
        with os.fdopen(tmp_fd, "w", encoding="utf-8") as f:
            f.write(code)
        proc = subprocess.run(
            [PYTHON, tmp_path],
            capture_output=True, text=True, timeout=TIMEOUT,
            encoding="utf-8", errors="replace",
        )
        return proc.stdout, proc.stderr, proc.returncode
    except subprocess.TimeoutExpired:
        return "", "[TIMEOUT setelah {} detik]".format(TIMEOUT), -1
    except Exception as e:
        return "", str(e), -1
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


def load_json(path):
    """Baca dan parse JSON, kembalikan (data, error_msg)."""
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f), None
    except json.JSONDecodeError as e:
        return None, f"JSON tidak valid: {e}"
    except FileNotFoundError:
        return None, "File tidak ditemukan"


def check_fields(data, required, file_label):
    """Cek apakah dict punya semua key yang diperlukan."""
    ok = True
    for key in required:
        if key not in data:
            log_fail(file_label, f"Field wajib hilang: '{key}'")
            ok = False
    return ok


# ── Pengecekan MATERI ────────────────────────────────────────────────
MATERI_TOP_FIELDS = ["id", "judul", "tujuan", "prasyarat", "ringkasan",
                     "durasi_menit", "bagian", "latihan_editor",
                     "poin_penting", "istilah"]
BAGIAN_FIELDS = ["id", "judul", "penjelasan", "analogi", "contoh_kode",
                 "output_contoh", "penjelasan_kode", "catatan_umum_salah",
                 "coba_sendiri"]
LATIHAN_FIELDS = ["instruksi", "kode_awal", "output_diharapkan"]


def verify_materi(bab_num):
    fname = f"bab-{bab_num}.json"
    fpath = os.path.join(CONTENT_DIR, fname)
    if not os.path.exists(fpath):
        return None  # belum ada

    print(f"\n{'─' * 60}")
    print(f"  MATERI: {fname}")
    print(f"{'─' * 60}")

    data, err = load_json(fpath)
    if err:
        log_fail(fname, err)
        return False

    log_pass(fname, "JSON valid")

    # Field wajib top-level
    if not check_fields(data, MATERI_TOP_FIELDS, fname):
        return False

    # id cocok nama file
    expected_id = f"bab-{bab_num}"
    if data.get("id") != expected_id:
        log_fail(fname, f"id di dalam file = '{data.get('id')}', diharapkan '{expected_id}'")

    # Cek setiap bagian
    for i, bagian in enumerate(data.get("bagian", [])):
        bagian_label = f"{fname} > bagian[{i}] ({bagian.get('id', '?')})"
        check_fields(bagian, BAGIAN_FIELDS, bagian_label)

        code = bagian.get("contoh_kode", "")
        expected_out = bagian.get("output_contoh", "")

        # Cek pemakaian input()
        if "input(" in code:
            log_fail(bagian_label, "contoh_kode memakai input() — tidak boleh di Pyodide")

        # Jalankan contoh_kode
        stdout, stderr, rc = run_code(code, bagian_label)
        actual = normalize(stdout)
        expected = normalize(expected_out)

        if rc != 0 and rc != -1:
            # Kode error — mungkin sengaja (contoh error di komentar), cek outputnya
            if actual == expected:
                log_pass(bagian_label, f"contoh_kode output cocok (rc={rc})")
            elif expected == "":
                log_info(bagian_label,
                         f"contoh_kode exit rc={rc}, output_contoh kosong — mungkin kode contoh error yang dikomentari")
            else:
                log_fail(bagian_label,
                         f"contoh_kode exit rc={rc}\n"
                         f"      stderr : {stderr.strip().splitlines()[-1] if stderr.strip() else '?'}\n"
                         f"      expected: {repr(expected)}\n"
                         f"      actual  : {repr(actual)}")
        else:
            if actual == expected:
                log_pass(bagian_label, "contoh_kode output cocok")
            else:
                log_fail(bagian_label,
                         f"contoh_kode output TIDAK cocok\n"
                         f"      expected: {repr(expected)}\n"
                         f"      actual  : {repr(actual)}")

    # Latihan editor
    lat = data.get("latihan_editor", {})
    lat_label = f"{fname} > latihan_editor"
    check_fields(lat, LATIHAN_FIELDS, lat_label)

    kode_awal = lat.get("kode_awal", "")
    stdout, stderr, rc = run_code(kode_awal, lat_label)
    if rc == 0:
        log_pass(lat_label, f"kode_awal jalan tanpa error")
        log_info(lat_label, f"kode_awal output: {repr(normalize(stdout))}")
    else:
        log_fail(lat_label, f"kode_awal error (rc={rc}): {stderr.strip().splitlines()[-1] if stderr.strip() else '?'}")

    return True


# ── Pengecekan KUIS ──────────────────────────────────────────────────
KUIS_TOP_FIELDS = ["bab", "judul_kuis", "soal"]
SOAL_FIELDS = ["id", "tingkat", "capaian", "pertanyaan", "kode", "opsi",
               "jawaban_benar", "pembahasan", "petunjuk"]


def verify_kuis(bab_num):
    fname = f"kuis-bab-{bab_num}.json"
    fpath = os.path.join(CONTENT_DIR, fname)
    if not os.path.exists(fpath):
        return None

    print(f"\n{'─' * 60}")
    print(f"  KUIS: {fname}")
    print(f"{'─' * 60}")

    data, err = load_json(fpath)
    if err:
        log_fail(fname, err)
        return False

    log_pass(fname, "JSON valid")

    if not check_fields(data, KUIS_TOP_FIELDS, fname):
        return False

    expected_bab = f"bab-{bab_num}"
    if data.get("bab") != expected_bab:
        log_fail(fname, f"bab di dalam file = '{data.get('bab')}', diharapkan '{expected_bab}'")

    dist = {0: 0, 1: 0, 2: 0, 3: 0}

    for i, soal in enumerate(data.get("soal", [])):
        soal_label = f"{fname} > soal {soal.get('id', '?')}"
        check_fields(soal, SOAL_FIELDS, soal_label)

        opsi = soal.get("opsi", [])
        jb = soal.get("jawaban_benar")

        # Cek 4 opsi
        if len(opsi) != 4:
            log_fail(soal_label, f"Jumlah opsi = {len(opsi)}, harus 4")

        # Cek jawaban_benar valid
        if not isinstance(jb, int) or jb < 0 or jb > 3:
            log_fail(soal_label, f"jawaban_benar = {jb}, harus 0-3")
        else:
            dist[jb] += 1
            log_pass(soal_label, f"jawaban_benar = {jb}, valid")

        # Jalankan kode jika ada
        kode = soal.get("kode")
        if kode is not None:
            stdout, stderr, rc = run_code(kode, soal_label)
            actual = normalize(stdout)
            jawaban_teks = opsi[jb] if 0 <= jb < len(opsi) else "?"

            if rc == 0:
                print(f"  Soal {soal.get('id')}: output  = {repr(actual)}")
                print(f"  {'':>8}jawaban = {repr(jawaban_teks)}")
                if actual == jawaban_teks:
                    log_pass(soal_label, "Output kode == teks jawaban benar")
                else:
                    log_info(soal_label,
                             f"Output kode != teks jawaban benar (mungkin soal bukan prediksi output)\n"
                             f"      output : {repr(actual)}\n"
                             f"      jawaban: {repr(jawaban_teks)}")
            else:
                err_line = stderr.strip().splitlines()[-1] if stderr.strip() else "?"
                print(f"  Soal {soal.get('id')}: kode ERROR — {err_line}")
                print(f"  {'':>8}jawaban = {repr(jawaban_teks)}")
                log_info(soal_label,
                         f"Kode error (mungkin sengaja untuk soal cari kesalahan): {err_line}")

    # Distribusi jawaban
    print(f"\n  Distribusi jawaban_benar bab-{bab_num}:")
    for idx in range(4):
        bar = "#" * dist[idx]
        print(f"    indeks {idx}: {dist[idx]}  {bar}")

    return True


# ── Pengecekan TANTANGAN ─────────────────────────────────────────────
TANTANGAN_TOP_FIELDS = ["bab", "tantangan"]
TANTANGAN_ITEM_FIELDS = ["id", "tingkat", "judul", "cerita", "instruksi",
                         "kode_awal", "output_diharapkan", "contoh_solusi",
                         "petunjuk", "kesalahan_umum"]


def verify_tantangan(bab_num):
    fname = f"tantangan-bab-{bab_num}.json"
    fpath = os.path.join(CONTENT_DIR, fname)
    if not os.path.exists(fpath):
        return None

    print(f"\n{'─' * 60}")
    print(f"  TANTANGAN: {fname}")
    print(f"{'─' * 60}")

    data, err = load_json(fpath)
    if err:
        log_fail(fname, err)
        return False

    log_pass(fname, "JSON valid")

    if not check_fields(data, TANTANGAN_TOP_FIELDS, fname):
        return False

    expected_bab = f"bab-{bab_num}"
    if data.get("bab") != expected_bab:
        log_fail(fname, f"bab di dalam file = '{data.get('bab')}', diharapkan '{expected_bab}'")

    for i, t in enumerate(data.get("tantangan", [])):
        t_label = f"{fname} > tantangan {t.get('id', '?')} ({t.get('judul', '?')})"
        check_fields(t, TANTANGAN_ITEM_FIELDS, t_label)

        expected_out = normalize(t.get("output_diharapkan", ""))
        solusi = t.get("contoh_solusi", "")
        kode_awal = t.get("kode_awal", "")

        # Jalankan contoh_solusi
        stdout, stderr, rc = run_code(solusi, t_label)
        actual = normalize(stdout)
        if rc == 0 and actual == expected_out:
            log_pass(t_label, "contoh_solusi output cocok")
        elif rc != 0:
            log_fail(t_label,
                     f"contoh_solusi error (rc={rc}): "
                     f"{stderr.strip().splitlines()[-1] if stderr.strip() else '?'}")
        else:
            log_fail(t_label,
                     f"contoh_solusi output TIDAK cocok\n"
                     f"      expected: {repr(expected_out)}\n"
                     f"      actual  : {repr(actual)}")

        # Jalankan kode_awal (info saja)
        stdout2, stderr2, rc2 = run_code(kode_awal, t_label)
        actual2 = normalize(stdout2)
        if rc2 != 0:
            log_info(t_label,
                     f"kode_awal error (rc={rc2}): "
                     f"{stderr2.strip().splitlines()[-1] if stderr2.strip() else '?'}")
        elif actual2 == expected_out:
            log_info(t_label, "kode_awal SUDAH menghasilkan output yang benar (mungkin tidak disengaja)")
        else:
            log_info(t_label, f"kode_awal jalan OK, output: {repr(actual2)}")

    return True


# ── MAIN ─────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  VERIFIKASI KONTEN PYTHONIN")
    print(f"  Folder : {CONTENT_DIR}")
    print(f"  Python : {PYTHON}")
    print("=" * 60)

    found_any = False

    for bab in range(1, MAX_BAB + 1):
        results = []
        r_materi = verify_materi(bab)
        r_kuis = verify_kuis(bab)
        r_tantangan = verify_tantangan(bab)

        if r_materi is None and r_kuis is None and r_tantangan is None:
            if bab <= 5:  # hanya laporkan bab 1-5 (sesuai kurikulum)
                log_info(f"bab-{bab}", "Belum ada file konten untuk bab ini")
            continue

        found_any = True

    if not found_any:
        print("\n[!] Tidak ada file konten ditemukan di folder content/.")
        sys.exit(1)

    # ── Ringkasan ────────────────────────────────────────────────────
    print("\n")
    print("=" * 60)
    print("  RINGKASAN")
    print("=" * 60)

    print(f"\n  LOLOS  : {len(passes)}")
    for f, d in passes:
        print(f"    [OK]   {f}: {d}")

    if infos:
        print(f"\n  INFO   : {len(infos)}")
        for f, d in infos:
            print(f"    [i]    {f}: {d}")

    if failures:
        print(f"\n  GAGAL  : {len(failures)}")
        for f, d in failures:
            print(f"    [FAIL] {f}: {d}")
    else:
        print(f"\n  GAGAL  : 0")

    total = len(passes) + len(failures)
    print(f"\n  Total cek: {total}  |  Lolos: {len(passes)}  |  Gagal: {len(failures)}  |  Info: {len(infos)}")

    if failures:
        print("\n  >>> ADA KEGAGALAN — exit code 1 <<<")
        sys.exit(1)
    else:
        print("\n  >>> SEMUA LOLOS — exit code 0 <<<")
        sys.exit(0)


if __name__ == "__main__":
    main()
