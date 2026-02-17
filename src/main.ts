import './style.css';
import { templates } from './templates';
import type { DocTemplate } from './templates';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// State
let currentTemplate: DocTemplate | null = null;

let items: { name: string; unit: string; qty: number; price: number; note?: string }[] = [{ name: '', unit: 'cái', qty: 1, price: 0 }];
let selectedClauses: string[] = [];

// ===== Theme =====
const initTheme = () => {
  const saved = localStorage.getItem('vilex-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
};

const updateThemeIcon = (t: string) => {
  const ic = document.querySelector('.theme-icon');
  if (ic) ic.textContent = t === 'dark' ? 'light_mode' : 'dark_mode';
};

// ===== Stepper =====
const updateStepper = (step: number) => {

  const steps = document.querySelectorAll('.stepper-step');
  const lines = document.querySelectorAll('.stepper-line');

  steps.forEach((el, i) => {
    const s = i + 1;
    el.classList.remove('active', 'completed');
    if (s < step) el.classList.add('completed');
    else if (s === step) el.classList.add('active');
  });

  lines.forEach((line, i) => {
    line.classList.remove('filled', 'filling');
    if (i < step - 1) line.classList.add('filled');
    else if (i === step - 1) line.classList.add('filling');
  });
};

// ===== Navigation =====
const showStep = (n: number) => {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step${n}`)?.classList.add('active');
  updateStepper(n);
  // Show search only on step 1
  const headerSearch = document.getElementById('headerSearch');
  if (headerSearch) headerSearch.style.visibility = n === 1 ? 'visible' : 'hidden';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ===== Render Document Cards =====
const renderCards = (filter = '') => {
  const grid = document.getElementById('docGrid');
  const noResults = document.getElementById('noResults');
  if (!grid || !noResults) return;

  const filterLower = filter.toLowerCase().trim();

  const filtered = filterLower
    ? templates.filter(t =>
      t.title.toLowerCase().includes(filterLower) ||
      t.desc.toLowerCase().includes(filterLower) ||
      (t.badge && t.badge.toLowerCase().includes(filterLower))
    )
    : templates;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }

  noResults.style.display = 'none';

  // Color map per document type for variety
  const colorMap: Record<string, string> = {
    quotation: '#ea4335',    // red
    invoice: '#4285f4',      // blue
    rental: '#34a853',       // green
    service: '#fbbc04',      // yellow
    sales: '#8e24aa',        // purple
    labor: '#00897b',        // teal
    poa: '#f4511e',          // deep orange
    liquidation: '#546e7a',  // blue grey
    handover: '#ff6d00',     // orange
    receipt: '#1e88e5',      // light blue
  };

  grid.innerHTML = filtered.map((t, i) => `
    <div class="doc-card" data-id="${t.id}" data-color="${colorMap[t.id] || '#4285f4'}" style="animation-delay: ${Math.min(i * 0.05, 0.5)}s">
      ${t.badge ? `<span class="doc-card-badge" style="background:${colorMap[t.id]}20;color:${colorMap[t.id]}">${t.badge}</span>` : ''}
      <div class="doc-card-visual" style="background:${colorMap[t.id]}10">
        <span class="doc-card-icon" style="background:${colorMap[t.id]}18">${t.icon}</span>
      </div>
      <div class="doc-card-body">
        <div class="doc-card-title">${t.title}</div>
        <div class="doc-card-desc">${t.desc}</div>
        <div class="doc-card-action" style="color:${colorMap[t.id]}">
          <span class="material-symbols-outlined">arrow_forward</span>
          <span>Tạo văn bản</span>
        </div>
      </div>
    </div>
  `).join('');

  // Update template count
  const countEl = document.getElementById('templateCount');
  if (countEl) countEl.textContent = String(filtered.length);

  grid.querySelectorAll('.doc-card').forEach(card => {
    const el = card as HTMLElement;
    const color = el.dataset.color || '#4f46e5';

    // Glow effect on hover
    el.addEventListener('mouseenter', () => {
      el.style.boxShadow = `0 8px 32px ${color}30, 0 0 60px ${color}15`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.boxShadow = '';
    });

    // Click to select
    el.addEventListener('click', () => {
      const id = el.dataset.id!;
      currentTemplate = templates.find(t => t.id === id) || null;
      if (currentTemplate) openForm(currentTemplate);
    });
  });
};

// ===== Build Form =====
const openForm = (tmpl: DocTemplate) => {
  const form = document.getElementById('docForm');
  const title = document.getElementById('step2Title');
  const desc = document.getElementById('step2Desc');
  if (!form || !title || !desc) return;

  title.textContent = `${tmpl.icon} ${tmpl.title}`;
  desc.textContent = tmpl.desc;

  // Group fields by section
  const sections: Record<string, typeof tmpl.fields> = {};
  tmpl.fields.forEach(f => {
    const sec = f.section || 'Thông tin';
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(f);
  });

  let html = '';
  for (const [secName, fields] of Object.entries(sections)) {
    html += `<div class="form-section">
      <div class="form-section-title">📌 ${secName}</div>
      <div class="form-row">`;
    fields.forEach(f => {
      const cls = f.full ? 'form-group full' : 'form-group';
      const req = f.required ? '<span class="required">*</span>' : '';
      let input = '';
      if (f.type === 'textarea') {
        input = `<textarea id="f_${f.id}" placeholder="${f.placeholder || ''}">${f.defaultValue || ''}</textarea>`;
      } else if (f.type === 'select') {
        const opts = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('');
        input = `<select id="f_${f.id}">${opts}</select>`;
      } else {
        input = `<input type="${f.type}" id="f_${f.id}" placeholder="${f.placeholder || ''}" value="${f.defaultValue || ''}" ${f.required ? 'required' : ''} />`;
      }
      html += `<div class="${cls}"><label for="f_${f.id}">${f.label}${req}</label>${input}</div>`;
    });
    html += `</div></div>`;
  }

  // Items table
  if (tmpl.hasItems) {
    items = [{ name: '', unit: 'cái', qty: 1, price: 0 }];
    html += renderItemsSection(tmpl.id === 'handover');
  }

  form.innerHTML = html;

  // Clauses
  const clauseSec = document.getElementById('clauseSection');
  const clauseList = document.getElementById('clauseList');
  if (clauseSec && clauseList) {
    if (tmpl.clauses.length > 0) {
      clauseSec.style.display = 'block';
      selectedClauses = tmpl.clauses.filter(c => c.checked).map(c => c.id);
      clauseList.innerHTML = tmpl.clauses.map(c => `
        <label class="clause-item ${selectedClauses.includes(c.id) ? 'checked' : ''}" data-clause="${c.id}">
          <input type="checkbox" ${selectedClauses.includes(c.id) ? 'checked' : ''} />
          <div class="clause-info">
            <div class="clause-name">${c.name}</div>
            <div class="clause-preview">${c.preview}</div>
          </div>
        </label>
      `).join('');

      clauseList.querySelectorAll('.clause-item').forEach(item => {
        const cb = item.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const id = (item as HTMLElement).dataset.clause!;
        cb.addEventListener('change', () => {
          if (cb.checked) {
            selectedClauses.push(id);
            item.classList.add('checked');
          } else {
            selectedClauses = selectedClauses.filter(c => c !== id);
            item.classList.remove('checked');
          }
        });
      });
    } else {
      clauseSec.style.display = 'none';
      selectedClauses = [];
    }
  }

  // Bind item events
  if (tmpl.hasItems) bindItemEvents(tmpl.id === 'handover');

  showStep(2);
};

const renderItemsSection = (isHandover = false) => {
  const cols = isHandover
    ? `<th class="col-stt">STT</th><th class="col-name">Tên tài sản</th><th class="col-unit">ĐVT</th><th class="col-qty">SL</th><th>Ghi chú</th><th class="col-action"></th>`
    : `<th class="col-stt">STT</th><th class="col-name">Mô tả</th><th class="col-unit">ĐVT</th><th class="col-qty">SL</th><th class="col-price">Đơn giá</th><th class="col-total">Thành tiền</th><th class="col-action"></th>`;
  const rows = items.map((it, i) => renderItemRow(it, i, isHandover)).join('');
  return `
    <div class="form-section">
      <div class="form-section-title">📦 Danh sách hàng hóa / tài sản</div>
      <div class="items-table-wrap">
        <table class="items-table" id="itemsTable">
          <thead><tr>${cols}</tr></thead>
          <tbody id="itemsBody">${rows}</tbody>
        </table>
      </div>
      <button type="button" class="btn-add-row" id="addRowBtn">+ Thêm dòng</button>
    </div>`;
};

const renderItemRow = (it: any, i: number, isHandover = false) => {
  if (isHandover) {
    return `<tr>
      <td class="col-stt">${i + 1}</td>
      <td><input type="text" data-field="name" data-idx="${i}" value="${it.name || ''}" placeholder="Tên tài sản" /></td>
      <td><input type="text" data-field="unit" data-idx="${i}" value="${it.unit || ''}" placeholder="ĐVT" /></td>
      <td><input type="number" data-field="qty" data-idx="${i}" value="${it.qty || 0}" min="0" /></td>
      <td><input type="text" data-field="note" data-idx="${i}" value="${it.note || ''}" placeholder="Tình trạng" /></td>
      <td><button type="button" class="btn-remove-row" data-idx="${i}">✕</button></td>
    </tr>`;
  }
  const total = (it.qty || 0) * (it.price || 0);
  return `<tr>
    <td class="col-stt">${i + 1}</td>
    <td><input type="text" data-field="name" data-idx="${i}" value="${it.name || ''}" placeholder="Mô tả" /></td>
    <td><input type="text" data-field="unit" data-idx="${i}" value="${it.unit || ''}" placeholder="ĐVT" /></td>
    <td><input type="number" data-field="qty" data-idx="${i}" value="${it.qty || 0}" min="0" /></td>
    <td><input type="number" data-field="price" data-idx="${i}" value="${it.price || 0}" min="0" /></td>
    <td style="text-align:right;font-family:var(--font-mono);padding:0.5rem">${new Intl.NumberFormat('vi-VN').format(total)}</td>
    <td><button type="button" class="btn-remove-row" data-idx="${i}">✕</button></td>
  </tr>`;
};

const bindItemEvents = (isHandover = false) => {
  const body = document.getElementById('itemsBody');
  const addBtn = document.getElementById('addRowBtn');
  if (!body || !addBtn) return;

  body.addEventListener('input', (e) => {
    const el = e.target as HTMLInputElement;
    const idx = parseInt(el.dataset.idx || '0');
    const field = el.dataset.field!;
    if (field === 'qty' || field === 'price') {
      (items[idx] as any)[field] = parseFloat(el.value) || 0;
    } else {
      (items[idx] as any)[field] = el.value;
    }
    refreshItemsTable(isHandover);
  });

  body.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.btn-remove-row') as HTMLElement;
    if (btn && items.length > 1) {
      items.splice(parseInt(btn.dataset.idx || '0'), 1);
      refreshItemsTable(isHandover);
    }
  });

  addBtn.addEventListener('click', () => {
    items.push({ name: '', unit: 'cái', qty: 1, price: 0 });
    refreshItemsTable(isHandover);
  });
};

const refreshItemsTable = (isHandover = false) => {
  const body = document.getElementById('itemsBody');
  if (!body) return;
  body.innerHTML = items.map((it, i) => renderItemRow(it, i, isHandover)).join('');
};

// ===== Collect form data =====
const collectFormData = (): Record<string, any> => {
  const data: Record<string, any> = {};
  if (!currentTemplate) return data;
  currentTemplate.fields.forEach(f => {
    const el = document.getElementById(`f_${f.id}`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (el) {
      data[f.id] = f.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
    }
  });
  return data;
};

// ===== Validate =====
const validate = (): boolean => {
  if (!currentTemplate) return false;
  for (const f of currentTemplate.fields) {
    if (f.required) {
      const el = document.getElementById(`f_${f.id}`) as HTMLInputElement;
      if (!el || !el.value.trim()) {
        showToast(`Vui lòng nhập: ${f.label}`, 'error');
        el?.focus();
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return false;
      }
    }
  }
  return true;
};

// ===== Preview =====
const renderPreview = () => {
  if (!currentTemplate) return;
  const data = collectFormData();
  const html = currentTemplate.render(data, selectedClauses, currentTemplate.hasItems ? items : undefined);
  const previewEl = document.getElementById('previewContent');
  if (previewEl) previewEl.innerHTML = html;
};

// ===== PDF Export =====
const exportPDF = async () => {
  if (!validate()) return;
  renderPreview();

  showToast('Đang tạo PDF...', 'info');

  const step3 = document.getElementById('step3')!;
  const wasActive = step3.classList.contains('active');
  if (!wasActive) step3.classList.add('active');

  const el = document.getElementById('previewContent')!;

  try {
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const pageH = 297;
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let heightLeft = imgH;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgW, imgH);
      heightLeft -= pageH;
    }

    const fileName = `${currentTemplate!.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(fileName);
    showToast('Xuất PDF thành công!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Lỗi khi tạo PDF', 'error');
  }

  if (!wasActive) step3.classList.remove('active');
};

// ===== Toast =====
const showToast = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
  const t = document.getElementById('toast');
  if (!t) return;

  const icon = t.querySelector('.toast-icon-mat') as HTMLElement;
  const msgEl = t.querySelector('.toast-msg') as HTMLElement;

  const icons: Record<string, string> = {
    info: 'info',
    success: 'check_circle',
    error: 'error'
  };

  if (icon) icon.textContent = icons[type] || 'info';
  if (msgEl) msgEl.textContent = msg;

  t.className = `toast show ${type}`;
  setTimeout(() => t.classList.remove('show'), 3500);
};

// ===== Initialize App =====
const initApp = () => {
  // Theme
  initTheme();

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('vilex-theme', next);
    updateThemeIcon(next);
  });

  // Navigation
  document.getElementById('backToStep1')?.addEventListener('click', () => showStep(1));
  document.getElementById('backToStep2')?.addEventListener('click', () => showStep(2));
  document.getElementById('editBtn')?.addEventListener('click', () => showStep(2));

  // Preview
  document.getElementById('previewBtn')?.addEventListener('click', () => {
    if (!validate()) return;
    renderPreview();
    showStep(3);
  });

  // PDF Export
  document.getElementById('exportPdfBtn')?.addEventListener('click', exportPDF);
  document.getElementById('exportPdfBtn2')?.addEventListener('click', exportPDF);

  // Search
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchClear = document.getElementById('searchClear') as HTMLButtonElement;
  let searchTimeout: ReturnType<typeof setTimeout>;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      renderCards(searchInput.value);
    }, 200);
    if (searchClear) searchClear.style.display = searchInput.value ? 'flex' : 'none';
  });
  searchClear?.addEventListener('click', () => {
    if (searchInput) {
      searchInput.value = '';
      renderCards('');
      searchInput.focus();
    }
    if (searchClear) searchClear.style.display = 'none';
  });


  // Render cards & stepper
  renderCards();
  updateStepper(1);
};

// Wait for DOM to be fully ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
