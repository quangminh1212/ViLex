export interface FormField {
  id: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' | 'select';
  required?: boolean; placeholder?: string; options?: string[]; defaultValue?: string;
  section?: string; full?: boolean;
}

export interface Clause {
  id: string; name: string; preview: string; content: string; checked?: boolean;
}

export interface DocTemplate {
  id: string; icon: string; title: string; desc: string; badge?: string;
  fields: FormField[]; clauses: Clause[]; hasItems?: boolean;
  render: (data: Record<string, any>, clauses: string[], items?: any[]) => string;
}

const today = () => { const d = new Date(); return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`; };
const moneyFmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

const partyAFields = (prefix = 'a'): FormField[] => [
  { id: `${prefix}_name`, label: 'Họ và tên / Tên công ty', type: 'text', required: true, section: `Bên ${prefix.toUpperCase()}`, placeholder: 'Nguyễn Văn A / Công ty TNHH ABC' },
  { id: `${prefix}_id`, label: 'CMND/CCCD/MST', type: 'text', required: true, placeholder: '0123456789' },
  { id: `${prefix}_address`, label: 'Địa chỉ', type: 'text', required: true, placeholder: '123 Nguyễn Huệ, Q.1, TP.HCM', full: true },
  { id: `${prefix}_phone`, label: 'Số điện thoại', type: 'text', placeholder: '0901234567' },
  { id: `${prefix}_email`, label: 'Email', type: 'text', placeholder: 'email@example.com' },
];

const partyFields: FormField[] = [...partyAFields('a'), ...partyAFields('b')];

const renderParty = (d: Record<string, any>, prefix: string, label: string) => `
<div class="party-info">
  <p class="party-label">${label}</p>
  <p>Họ và tên/Tên công ty: <b>${d[`${prefix}_name`] || ''}</b></p>
  <p>CMND/CCCD/MST: ${d[`${prefix}_id`] || ''}</p>
  <p>Địa chỉ: ${d[`${prefix}_address`] || ''}</p>
  <p>Điện thoại: ${d[`${prefix}_phone`] || ''} ${d[`${prefix}_email`] ? '| Email: ' + d[`${prefix}_email`] : ''}</p>
</div>`;

const renderSig = (nameA: string, nameB: string) => `
<div class="signature-section">
  <div class="signature-block"><p class="sig-title">Bên A</p><p class="sig-note">(Ký, ghi rõ họ tên)</p><p class="sig-name">${nameA}</p></div>
  <div class="signature-block"><p class="sig-title">Bên B</p><p class="sig-note">(Ký, ghi rõ họ tên)</p><p class="sig-name">${nameB}</p></div>
</div>`;

const renderClauses = (ids: string[], allClauses: Clause[]) => {
  const selected = allClauses.filter(c => ids.includes(c.id));
  if (!selected.length) return '';
  return selected.map((c, i) => `<div class="article"><p class="article-title">Điều ${i + 10}. ${c.name}</p><div class="article-content"><p>${c.content}</p></div></div>`).join('');
};

/** Nguồn trích dẫn pháp lý chính thức */
const LEGAL_SOURCES: Record<string, { name: string; number: string; date: string; issuer: string; url: string }> = {
  blds2015: { name: 'Bộ luật Dân sự 2015', number: '91/2015/QH13', date: '24/11/2015', issuer: 'Quốc hội khóa XIII', url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=183188' },
  blld2019: { name: 'Bộ luật Lao động 2019', number: '45/2019/QH14', date: '20/11/2019', issuer: 'Quốc hội khóa XIV', url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=198486' },
  ltm2005: { name: 'Luật Thương mại 2005', number: '36/2005/QH11', date: '14/06/2005', issuer: 'Quốc hội khóa XI', url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=15587' },
  lno2023: { name: 'Luật Nhà ở 2023', number: '27/2023/QH15', date: '27/11/2023', issuer: 'Quốc hội khóa XV', url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=209274' },
  nd123: { name: 'Nghị định 123/2020/NĐ-CP', number: '123/2020/NĐ-CP', date: '19/10/2020', issuer: 'Chính phủ', url: 'https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=201455' },
};

const renderLegalFooter = (...keys: string[]) => {
  const sources = keys.map(k => LEGAL_SOURCES[k]).filter(Boolean);
  if (!sources.length) return '';
  return `
<div style="margin-top:2rem;padding-top:1rem;border-top:1px solid #ccc;font-size:0.8em;color:#666;line-height:1.6">
  <p style="font-weight:600;margin-bottom:0.3rem">📌 Căn cứ pháp lý:</p>
  ${sources.map(s => `<p>• ${s.name} (${s.number}), ${s.issuer} ban hành ngày ${s.date}. Nguồn: <a href="${s.url}" target="_blank" rel="noopener" style="color:#1a73e8">vanban.chinhphu.vn</a></p>`).join('')}
  <p style="margin-top:0.5rem;font-style:italic">⚠️ Văn bản này chỉ mang tính chất tham khảo. Vui lòng tra cứu tại <a href="https://vbpl.vn" target="_blank" rel="noopener" style="color:#1a73e8">vbpl.vn</a> (Cổng TTĐT Bộ Tư pháp) hoặc <a href="https://vanban.chinhphu.vn" target="_blank" rel="noopener" style="color:#1a73e8">vanban.chinhphu.vn</a> để đảm bảo tính chính xác và cập nhật.</p>
</div>`;
};

const commonClauses: Clause[] = [
  { id: 'force_majeure', name: 'Bất khả kháng', preview: 'Miễn trừ trách nhiệm khi có sự kiện bất khả kháng', content: 'Không bên nào phải chịu trách nhiệm về việc không thực hiện hoặc chậm trễ thực hiện nghĩa vụ do sự kiện bất khả kháng theo quy định tại Điều 156 Bộ luật Dân sự 2015. Bên bị ảnh hưởng phải thông báo cho bên kia trong vòng 07 ngày kể từ khi sự kiện xảy ra.', checked: true },
  { id: 'dispute', name: 'Giải quyết tranh chấp', preview: 'Thương lượng, hòa giải hoặc tòa án', content: 'Mọi tranh chấp phát sinh từ hoặc liên quan đến Hợp đồng này trước hết được giải quyết bằng thương lượng giữa hai bên. Trường hợp không thương lượng được trong 30 ngày, tranh chấp sẽ được đưa ra Tòa án nhân dân có thẩm quyền giải quyết theo pháp luật Việt Nam.', checked: true },
  { id: 'confidential', name: 'Bảo mật thông tin', preview: 'Cam kết bảo mật thông tin của các bên', content: 'Các bên cam kết bảo mật mọi thông tin liên quan đến Hợp đồng này và không tiết lộ cho bên thứ ba nếu không được sự đồng ý bằng văn bản của bên kia, trừ trường hợp theo yêu cầu của cơ quan nhà nước có thẩm quyền. Nghĩa vụ bảo mật có hiệu lực trong thời hạn 02 năm kể từ ngày chấm dứt Hợp đồng.' },
  { id: 'penalty', name: 'Phạt vi phạm', preview: 'Phạt 8% giá trị hợp đồng khi vi phạm', content: 'Bên vi phạm nghĩa vụ hợp đồng phải chịu phạt vi phạm bằng 8% giá trị phần nghĩa vụ bị vi phạm theo quy định tại Điều 418 Bộ luật Dân sự 2015. Ngoài khoản phạt, bên vi phạm còn phải bồi thường thiệt hại thực tế phát sinh.' },
  { id: 'amendment', name: 'Sửa đổi, bổ sung', preview: 'Mọi sửa đổi phải bằng văn bản', content: 'Mọi sửa đổi, bổ sung Hợp đồng này phải được lập thành văn bản, có chữ ký của đại diện hợp pháp của cả hai bên. Các phụ lục, bổ sung (nếu có) sẽ là phần không tách rời của Hợp đồng.' },
  { id: 'severability', name: 'Hiệu lực từng phần', preview: 'Điều khoản vô hiệu không ảnh hưởng toàn bộ HĐ', content: 'Nếu bất kỳ điều khoản nào của Hợp đồng bị cơ quan có thẩm quyền tuyên là vô hiệu, các điều khoản còn lại vẫn giữ nguyên hiệu lực. Các bên sẽ thương lượng thay thế điều khoản vô hiệu bằng điều khoản mới phù hợp với mục đích ban đầu.' },
];

export const templates: DocTemplate[] = [
  // 1. BÁO GIÁ
  {
    id: 'quotation', icon: '💰', title: 'Báo Giá', desc: 'Tạo báo giá chuyên nghiệp theo Luật Thương mại 2005 (36/2005/QH11)', badge: 'Phổ biến',
    hasItems: true,
    fields: [
      { id: 'company_name', label: 'Tên công ty', type: 'text', required: true, section: 'Thông tin công ty', placeholder: 'Công ty TNHH ABC' },
      { id: 'company_address', label: 'Địa chỉ', type: 'text', required: true, placeholder: '123 Nguyễn Huệ, Q.1, TP.HCM' },
      { id: 'company_phone', label: 'Điện thoại', type: 'text', placeholder: '028 1234 5678' },
      { id: 'company_tax', label: 'Mã số thuế', type: 'text', placeholder: '0301234567' },
      { id: 'quote_number', label: 'Số báo giá', type: 'text', section: 'Thông tin báo giá', placeholder: 'BG-2026-001' },
      { id: 'quote_date', label: 'Ngày báo giá', type: 'date', required: true },
      { id: 'valid_days', label: 'Hiệu lực (ngày)', type: 'number', defaultValue: '30' },
      { id: 'customer_name', label: 'Khách hàng', type: 'text', required: true, section: 'Thông tin khách hàng', placeholder: 'Công ty XYZ' },
      { id: 'customer_address', label: 'Địa chỉ', type: 'text', placeholder: '456 Lê Lợi, Q.3, TP.HCM' },
      { id: 'customer_phone', label: 'Điện thoại', type: 'text', placeholder: '0901234567' },
      { id: 'customer_contact', label: 'Người liên hệ', type: 'text', placeholder: 'Nguyễn Văn B' },
      { id: 'payment_terms', label: 'Điều kiện thanh toán', type: 'select', options: ['Thanh toán 100% trước khi giao hàng', 'Thanh toán 50% đặt cọc, 50% khi giao hàng', 'Thanh toán trong vòng 30 ngày', 'Theo thỏa thuận'], full: true },
      { id: 'notes', label: 'Ghi chú', type: 'textarea', placeholder: 'Ghi chú thêm...', full: true },
    ],
    clauses: [
      { id: 'warranty', name: 'Bảo hành', preview: 'Điều khoản bảo hành sản phẩm/dịch vụ', content: 'Sản phẩm/dịch vụ được bảo hành theo chính sách của công ty. Thời gian bảo hành tính từ ngày giao hàng/nghiệm thu.', checked: true },
      { id: 'delivery', name: 'Giao hàng', preview: 'Điều kiện và thời gian giao hàng', content: 'Thời gian giao hàng: trong vòng 7-14 ngày làm việc kể từ ngày xác nhận đơn hàng. Địa điểm giao hàng theo thỏa thuận.', checked: true },
    ],
    render(d, cl, items = []) {
      const itemRows = items.map((it, i) => {
        const total = (it.qty || 0) * (it.price || 0);
        return `<tr><td style="text-align:center">${i + 1}</td><td>${it.name || ''}</td><td style="text-align:center">${it.unit || ''}</td><td style="text-align:right">${it.qty || 0}</td><td style="text-align:right">${moneyFmt(it.price || 0)}</td><td style="text-align:right">${moneyFmt(total)}</td></tr>`;
      }).join('');
      const grandTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
      const vat = Math.round(grandTotal * 0.1);
      const clauseHtml = cl.length ? this.clauses.filter(c => cl.includes(c.id)).map(c => `<p><b>${c.name}:</b> ${c.content}</p>`).join('') : '';
      return `
<div class="doc-header-info">
  <p><b>${d.company_name || ''}</b></p>
  <p>${d.company_address || ''}</p>
  <p>ĐT: ${d.company_phone || ''} | MST: ${d.company_tax || ''}</p>
</div>
<h2>BÁO GIÁ</h2>
<p class="doc-number">Số: ${d.quote_number || '...'} — Ngày: ${d.quote_date || today()}</p>
<p><b>Kính gửi:</b> ${d.customer_name || ''}</p>
<p>Địa chỉ: ${d.customer_address || ''} | ĐT: ${d.customer_phone || ''}</p>
<p>Người liên hệ: ${d.customer_contact || ''}</p>
<p style="margin:1rem 0">Chúng tôi trân trọng gửi đến Quý khách báo giá như sau:</p>
<table><thead><tr><th>STT</th><th>Mô tả</th><th>ĐVT</th><th>SL</th><th>Đơn giá (VNĐ)</th><th>Thành tiền (VNĐ)</th></tr></thead>
<tbody>${itemRows}</tbody>
<tfoot>
<tr class="total-row"><td colspan="5" style="text-align:right">Cộng:</td><td style="text-align:right">${moneyFmt(grandTotal)}</td></tr>
<tr class="total-row"><td colspan="5" style="text-align:right">VAT (10%):</td><td style="text-align:right">${moneyFmt(vat)}</td></tr>
<tr class="total-row"><td colspan="5" style="text-align:right"><b>Tổng cộng:</b></td><td style="text-align:right"><b>${moneyFmt(grandTotal + vat)}</b></td></tr>
</tfoot></table>
<p><b>Điều kiện thanh toán:</b> ${d.payment_terms || ''}</p>
<p><b>Hiệu lực báo giá:</b> ${d.valid_days || 30} ngày</p>
${clauseHtml}
${d.notes ? `<p><b>Ghi chú:</b> ${d.notes}</p>` : ''}
${renderSig(d.company_name || '', '')}
${renderLegalFooter('ltm2005', 'blds2015')}`;
    }
  },

  // 2. HÓA ĐƠN
  {
    id: 'invoice', icon: '🧾', title: 'Hóa Đơn', desc: 'Tạo hóa đơn bán hàng / dịch vụ theo NĐ 123/2020/NĐ-CP', badge: 'Phổ biến',
    hasItems: true,
    fields: [
      { id: 'company_name', label: 'Tên công ty', type: 'text', required: true, section: 'Bên bán', placeholder: 'Công ty TNHH ABC' },
      { id: 'company_address', label: 'Địa chỉ', type: 'text', required: true, placeholder: '123 Nguyễn Huệ, Q.1, TP.HCM' },
      { id: 'company_phone', label: 'Điện thoại', type: 'text', placeholder: '028 1234 5678' },
      { id: 'company_tax', label: 'Mã số thuế', type: 'text', required: true, placeholder: '0301234567' },
      { id: 'company_bank', label: 'Số TK ngân hàng', type: 'text', placeholder: '1234567890 - Vietcombank' },
      { id: 'inv_number', label: 'Số hóa đơn', type: 'text', section: 'Thông tin hóa đơn', placeholder: 'HD-2026-001' },
      { id: 'inv_date', label: 'Ngày xuất', type: 'date', required: true },
      { id: 'customer_name', label: 'Khách hàng', type: 'text', required: true, section: 'Bên mua', placeholder: 'Công ty XYZ' },
      { id: 'customer_address', label: 'Địa chỉ', type: 'text', placeholder: '456 Lê Lợi, Q.3' },
      { id: 'customer_tax', label: 'MST khách hàng', type: 'text', placeholder: '0309876543' },
      { id: 'customer_phone', label: 'Điện thoại', type: 'text', placeholder: '0901234567' },
      { id: 'payment_method', label: 'Hình thức thanh toán', type: 'select', options: ['Chuyển khoản', 'Tiền mặt', 'Thẻ tín dụng'], full: true },
    ],
    clauses: [],
    render(d, _cl, items = []) {
      const itemRows = items.map((it, i) => {
        const total = (it.qty || 0) * (it.price || 0);
        return `<tr><td style="text-align:center">${i + 1}</td><td>${it.name || ''}</td><td style="text-align:center">${it.unit || ''}</td><td style="text-align:right">${it.qty || 0}</td><td style="text-align:right">${moneyFmt(it.price || 0)}</td><td style="text-align:right">${moneyFmt(total)}</td></tr>`;
      }).join('');
      const grandTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
      const vat = Math.round(grandTotal * 0.1);
      return `
<div class="doc-header-info"><p><b>${d.company_name || ''}</b></p><p>${d.company_address || ''}</p><p>ĐT: ${d.company_phone || ''} | MST: ${d.company_tax || ''}</p></div>
<h2>HÓA ĐƠN BÁN HÀNG</h2>
<p class="doc-number">Số: ${d.inv_number || '...'} — Ngày: ${d.inv_date || today()}</p>
<p><b>Khách hàng:</b> ${d.customer_name || ''}</p>
<p>Địa chỉ: ${d.customer_address || ''} | MST: ${d.customer_tax || ''}</p>
<p>Hình thức thanh toán: ${d.payment_method || ''}</p>
<table><thead><tr><th>STT</th><th>Mô tả</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
<tbody>${itemRows}</tbody>
<tfoot>
<tr class="total-row"><td colspan="5" style="text-align:right">Cộng tiền hàng:</td><td style="text-align:right">${moneyFmt(grandTotal)}</td></tr>
<tr class="total-row"><td colspan="5" style="text-align:right">Thuế GTGT (10%):</td><td style="text-align:right">${moneyFmt(vat)}</td></tr>
<tr class="total-row"><td colspan="5" style="text-align:right"><b>Tổng thanh toán:</b></td><td style="text-align:right"><b>${moneyFmt(grandTotal + vat)}</b></td></tr>
</tfoot></table>
${d.company_bank ? `<p><b>Thông tin chuyển khoản:</b> ${d.company_bank}</p>` : ''}
${renderSig('Người bán', 'Người mua')}
${renderLegalFooter('nd123', 'ltm2005')}`;
    }
  },

  // 3. HỢP ĐỒNG THUÊ NHÀ
  {
    id: 'rental', icon: '🏠', title: 'Hợp Đồng Thuê Nhà', desc: 'Hợp đồng cho thuê nhà/căn hộ theo BLDS 2015 và Luật Nhà ở 2023', badge: 'Bất động sản',
    fields: [
      ...partyFields,
      { id: 'property_address', label: 'Địa chỉ tài sản cho thuê', type: 'text', required: true, section: 'Thông tin tài sản', placeholder: 'Số 10 Đường ABC, P. XYZ, Q.1, TP.HCM', full: true },
      { id: 'property_area', label: 'Diện tích (m²)', type: 'number', required: true, placeholder: '100' },
      { id: 'property_desc', label: 'Mô tả tài sản', type: 'textarea', placeholder: 'Nhà 1 trệt 2 lầu, 3 phòng ngủ, 2 phòng tắm...', full: true },
      { id: 'rent_amount', label: 'Giá thuê/tháng (VNĐ)', type: 'number', required: true, section: 'Điều khoản thuê', placeholder: '10000000' },
      { id: 'deposit', label: 'Tiền đặt cọc (VNĐ)', type: 'number', required: true, placeholder: '20000000' },
      { id: 'rent_start', label: 'Ngày bắt đầu', type: 'date', required: true },
      { id: 'rent_end', label: 'Ngày kết thúc', type: 'date', required: true },
      { id: 'payment_day', label: 'Ngày thanh toán hàng tháng', type: 'number', defaultValue: '5', placeholder: '5' },
      { id: 'payment_method', label: 'Hình thức thanh toán', type: 'select', options: ['Chuyển khoản', 'Tiền mặt'], full: true },
    ],
    clauses: [
      ...commonClauses,
      { id: 'sublease', name: 'Không cho thuê lại', preview: 'Cấm cho thuê lại mà không có sự đồng ý', content: 'Bên B không được cho thuê lại, chuyển nhượng quyền thuê cho bên thứ ba dưới bất kỳ hình thức nào nếu không được sự đồng ý bằng văn bản của Bên A. Vi phạm điều này Bên A có quyền đơn phương chấm dứt hợp đồng.', checked: true },
      { id: 'repair', name: 'Sửa chữa & bảo trì', preview: 'Trách nhiệm sửa chữa của mỗi bên', content: 'Bên A chịu trách nhiệm sửa chữa lớn (kết cấu, hệ thống điện nước chính). Bên B chịu trách nhiệm bảo trì và sửa chữa nhỏ phát sinh trong quá trình sử dụng. Bên B phải thông báo ngay cho Bên A khi có hư hỏng cần sửa chữa lớn.', checked: true },
      { id: 'early_termination', name: 'Chấm dứt trước hạn', preview: 'Điều kiện chấm dứt hợp đồng trước hạn', content: 'Mỗi bên có quyền chấm dứt hợp đồng trước thời hạn với điều kiện thông báo bằng văn bản trước ít nhất 30 ngày. Bên chấm dứt trước hạn không có lý do chính đáng phải bồi thường cho bên kia 02 tháng tiền thuê.' },
      { id: 'utilities', name: 'Chi phí điện, nước, dịch vụ', preview: 'Quy định về thanh toán tiện ích', content: 'Bên B chịu trách nhiệm thanh toán toàn bộ chi phí điện, nước, internet, truyền hình cáp và phí quản lý (nếu có) phát sinh trong thời gian thuê, theo đồng hồ đo riêng hoặc hóa đơn tên Bên B.', checked: true },
    ],
    render(d, cl) {
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>HỢP ĐỒNG THUÊ NHÀ</h2>
<p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
<p style="text-indent:2em">Căn cứ Luật Nhà ở số 27/2023/QH15 ngày 27/11/2023 (có hiệu lực từ 01/08/2024);</p>
<p style="text-indent:2em">Căn cứ nhu cầu và khả năng thực tế của hai bên;</p>
<p style="margin:0.5rem 0">Hôm nay, chúng tôi gồm:</p>
${renderParty(d, 'a', 'BÊN CHO THUÊ (Bên A):')}
${renderParty(d, 'b', 'BÊN THUÊ (Bên B):')}
<p>Hai bên thỏa thuận ký kết hợp đồng thuê nhà với các điều khoản sau:</p>
<div class="article"><p class="article-title">Điều 1. Tài sản cho thuê</p><div class="article-content">
<p>Bên A đồng ý cho Bên B thuê tài sản tại: <b>${d.property_address || ''}</b></p>
<p>Diện tích: ${d.property_area || ''} m²</p>
${d.property_desc ? `<p>Mô tả: ${d.property_desc}</p>` : ''}</div></div>
<div class="article"><p class="article-title">Điều 2. Thời hạn thuê</p><div class="article-content">
<p>Từ ngày ${d.rent_start || '...'} đến ngày ${d.rent_end || '...'}.</p></div></div>
<div class="article"><p class="article-title">Điều 3. Giá thuê và thanh toán</p><div class="article-content">
<p>Giá thuê: <b>${moneyFmt(d.rent_amount || 0)} VNĐ/tháng</b></p>
<p>Tiền đặt cọc: <b>${moneyFmt(d.deposit || 0)} VNĐ</b></p>
<p>Thanh toán vào ngày ${d.payment_day || 5} hàng tháng bằng hình thức ${d.payment_method || 'chuyển khoản'}.</p>
<p>Tiền đặt cọc sẽ được hoàn trả khi Bên B trả lại tài sản đúng hạn và đúng hiện trạng.</p></div></div>
<div class="article"><p class="article-title">Điều 4. Quyền và nghĩa vụ của Bên A</p><div class="article-content">
<p>- Giao tài sản đúng hiện trạng đã thỏa thuận và đúng thời hạn.</p>
<p>- Đảm bảo quyền sử dụng của Bên B trong suốt thời gian thuê.</p>
<p>- Không được đơn phương tăng giá thuê trong thời hạn hợp đồng.</p></div></div>
<div class="article"><p class="article-title">Điều 5. Quyền và nghĩa vụ của Bên B</p><div class="article-content">
<p>- Sử dụng tài sản đúng mục đích, giữ gìn và bảo quản tài sản cẩn thận.</p>
<p>- Thanh toán tiền thuê đầy đủ và đúng hạn.</p>
<p>- Không được tự ý sửa chữa, cải tạo khi chưa được sự đồng ý của Bên A.</p>
<p>- Trả lại tài sản đúng hiện trạng khi hết hạn hợp đồng.</p></div></div>
${renderClauses(cl, this.clauses)}
<div class="article"><p class="article-title">Điều ${6 + cl.length}. Điều khoản chung</p><div class="article-content">
<p>Hợp đồng này được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>
<p>Hợp đồng có hiệu lực kể từ ngày ký.</p></div></div>
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015', 'lno2023')}`;
    }
  },

  // 4. HỢP ĐỒNG DỊCH VỤ
  {
    id: 'service', icon: '🤝', title: 'Hợp Đồng Dịch Vụ', desc: 'Hợp đồng cung cấp dịch vụ theo BLDS 2015 và Luật Thương mại 2005 (36/2005/QH11)',
    fields: [
      ...partyFields,
      { id: 'service_name', label: 'Tên dịch vụ', type: 'text', required: true, section: 'Nội dung dịch vụ', placeholder: 'Dịch vụ thiết kế website', full: true },
      { id: 'service_desc', label: 'Mô tả chi tiết', type: 'textarea', required: true, placeholder: 'Mô tả chi tiết phạm vi công việc...', full: true },
      { id: 'service_price', label: 'Giá trị hợp đồng (VNĐ)', type: 'number', required: true, placeholder: '50000000' },
      { id: 'deadline', label: 'Thời hạn hoàn thành', type: 'date', required: true },
      { id: 'payment_schedule', label: 'Tiến độ thanh toán', type: 'select', options: ['50% ký HĐ, 50% nghiệm thu', '30% ký HĐ, 30% giữa, 40% nghiệm thu', '100% sau nghiệm thu', 'Theo thỏa thuận riêng'], full: true },
    ],
    clauses: commonClauses,
    render(d, cl) {
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>HỢP ĐỒNG DỊCH VỤ</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
<p style="text-indent:2em">Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;</p>
${renderParty(d, 'a', 'BÊN CUNG CẤP DỊCH VỤ (Bên A):')}
${renderParty(d, 'b', 'BÊN SỬ DỤNG DỊCH VỤ (Bên B):')}
<div class="article"><p class="article-title">Điều 1. Nội dung dịch vụ</p><div class="article-content">
<p>Bên A cung cấp cho Bên B dịch vụ: <b>${d.service_name || ''}</b></p>
<p>${d.service_desc || ''}</p></div></div>
<div class="article"><p class="article-title">Điều 2. Giá trị hợp đồng</p><div class="article-content">
<p>Tổng giá trị: <b>${moneyFmt(d.service_price || 0)} VNĐ</b> (đã bao gồm VAT).</p>
<p>Tiến độ thanh toán: ${d.payment_schedule || ''}</p></div></div>
<div class="article"><p class="article-title">Điều 3. Thời hạn</p><div class="article-content">
<p>Hoàn thành trước ngày: <b>${d.deadline || '...'}</b></p></div></div>
<div class="article"><p class="article-title">Điều 4. Nghiệm thu</p><div class="article-content">
<p>Bên B nghiệm thu trong vòng 05 ngày làm việc kể từ khi Bên A bàn giao. Quá thời hạn không có ý kiến, coi như nghiệm thu đạt.</p></div></div>
${renderClauses(cl, this.clauses)}
<div class="article"><p class="article-title">Điều ${5 + cl.length}. Điều khoản chung</p><div class="article-content">
<p>Hợp đồng lập thành 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.</p></div></div>
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015', 'ltm2005')}`;
    }
  },

  // 5. HỢP ĐỒNG MUA BÁN
  {
    id: 'sales', icon: '📦', title: 'Hợp Đồng Mua Bán', desc: 'Hợp đồng mua bán hàng hóa theo BLDS 2015 và Luật Thương mại 2005 (36/2005/QH11)', hasItems: true,
    fields: [
      ...partyFields,
      { id: 'delivery_address', label: 'Địa điểm giao hàng', type: 'text', section: 'Thông tin giao dịch', placeholder: '123 ABC, TP.HCM', full: true },
      { id: 'delivery_date', label: 'Thời hạn giao hàng', type: 'date', required: true },
      { id: 'payment_method', label: 'Thanh toán', type: 'select', options: ['Chuyển khoản', 'Tiền mặt', 'L/C'], full: true },
    ],
    clauses: commonClauses,
    render(d, cl, items = []) {
      const itemRows = items.map((it, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${it.name || ''}</td><td style="text-align:center">${it.unit || ''}</td><td style="text-align:right">${it.qty || 0}</td><td style="text-align:right">${moneyFmt(it.price || 0)}</td><td style="text-align:right">${moneyFmt((it.qty || 0) * (it.price || 0))}</td></tr>`).join('');
      const total = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>HỢP ĐỒNG MUA BÁN HÀNG HÓA</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
<p style="text-indent:2em">Căn cứ Luật Thương mại số 36/2005/QH11 ngày 14/06/2005;</p>
<p style="text-indent:2em">Căn cứ nhu cầu và khả năng thực tế của hai bên;</p>
${renderParty(d, 'a', 'BÊN BÁN (Bên A):')}
${renderParty(d, 'b', 'BÊN MUA (Bên B):')}
<div class="article"><p class="article-title">Điều 1. Hàng hóa</p>
<table><thead><tr><th>STT</th><th>Tên hàng hóa</th><th>ĐVT</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>${itemRows}</tbody>
<tfoot><tr class="total-row"><td colspan="5" style="text-align:right"><b>Tổng:</b></td><td style="text-align:right"><b>${moneyFmt(total)}</b></td></tr></tfoot></table></div>
<div class="article"><p class="article-title">Điều 2. Giao hàng</p><div class="article-content"><p>Địa điểm: ${d.delivery_address || ''}</p><p>Thời hạn: ${d.delivery_date || '...'}</p></div></div>
<div class="article"><p class="article-title">Điều 3. Thanh toán</p><div class="article-content"><p>Hình thức: ${d.payment_method || ''}</p></div></div>
${renderClauses(cl, this.clauses)}
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015', 'ltm2005')}`;
    }
  },

  // 6. HỢP ĐỒNG LAO ĐỘNG
  {
    id: 'labor', icon: '👔', title: 'Hợp Đồng Lao Động', desc: 'Theo Bộ luật Lao động 2019 (45/2019/QH14), có hiệu lực từ 01/01/2021', badge: 'Quan trọng',
    fields: [
      { id: 'a_name', label: 'Tên công ty', type: 'text', required: true, section: 'Bên sử dụng lao động (Bên A)', placeholder: 'Công ty TNHH ABC' },
      { id: 'a_address', label: 'Địa chỉ', type: 'text', required: true, placeholder: '123 Nguyễn Huệ' },
      { id: 'a_id', label: 'MST', type: 'text', required: true, placeholder: '0301234567' },
      { id: 'a_rep', label: 'Người đại diện', type: 'text', required: true, placeholder: 'Nguyễn Văn X' },
      { id: 'a_position', label: 'Chức vụ', type: 'text', placeholder: 'Giám đốc' },
      { id: 'b_name', label: 'Họ và tên', type: 'text', required: true, section: 'Người lao động (Bên B)', placeholder: 'Nguyễn Văn A' },
      { id: 'b_id', label: 'CMND/CCCD', type: 'text', required: true, placeholder: '0123456789' },
      { id: 'b_dob', label: 'Ngày sinh', type: 'date' },
      { id: 'b_address', label: 'Địa chỉ thường trú', type: 'text', required: true, placeholder: '456 Lê Lợi', full: true },
      { id: 'contract_type', label: 'Loại hợp đồng', type: 'select', section: 'Nội dung lao động', options: ['Không xác định thời hạn', 'Xác định thời hạn (12 tháng)', 'Xác định thời hạn (36 tháng)'], full: true },
      { id: 'start_date', label: 'Ngày bắt đầu', type: 'date', required: true },
      { id: 'job_title', label: 'Chức danh', type: 'text', required: true, placeholder: 'Nhân viên kinh doanh' },
      { id: 'work_location', label: 'Địa điểm làm việc', type: 'text', placeholder: 'Trụ sở công ty' },
      { id: 'salary', label: 'Lương cơ bản (VNĐ/tháng)', type: 'number', required: true, placeholder: '15000000' },
      { id: 'allowance', label: 'Phụ cấp (VNĐ/tháng)', type: 'number', placeholder: '2000000' },
      { id: 'probation', label: 'Thử việc (ngày)', type: 'number', defaultValue: '60' },
      { id: 'work_hours', label: 'Giờ làm việc', type: 'text', defaultValue: '8:00 - 17:00, Thứ 2 - Thứ 6', full: true },
    ],
    clauses: [
      ...commonClauses,
      { id: 'insurance', name: 'Bảo hiểm xã hội', preview: 'Đóng BHXH, BHYT, BHTN theo luật', content: 'Bên A có trách nhiệm đóng bảo hiểm xã hội, bảo hiểm y tế, bảo hiểm thất nghiệp cho Bên B theo quy định của pháp luật hiện hành. Bên B đồng ý để Bên A trích lương đóng phần bảo hiểm thuộc trách nhiệm của người lao động.', checked: true },
      { id: 'annual_leave', name: 'Nghỉ phép', preview: '12 ngày phép năm theo luật', content: 'Bên B được hưởng 12 ngày nghỉ phép năm hưởng nguyên lương theo Điều 113 Bộ luật Lao động 2019. Ngày nghỉ phép tăng thêm theo thâm niên: cứ 05 năm làm việc thêm 01 ngày.', checked: true },
    ],
    render(d, cl) {
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>HỢP ĐỒNG LAO ĐỘNG</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Lao động số 45/2019/QH14 ngày 20/11/2019;</p>
<div class="party-info"><p class="party-label">BÊN SỬ DỤNG LAO ĐỘNG (Bên A):</p>
<p>Tên công ty: <b>${d.a_name || ''}</b></p><p>Địa chỉ: ${d.a_address || ''}</p><p>MST: ${d.a_id || ''}</p>
<p>Đại diện: <b>${d.a_rep || ''}</b> — Chức vụ: ${d.a_position || ''}</p></div>
<div class="party-info"><p class="party-label">NGƯỜI LAO ĐỘNG (Bên B):</p>
<p>Họ và tên: <b>${d.b_name || ''}</b></p><p>CMND/CCCD: ${d.b_id || ''} ${d.b_dob ? '| Ngày sinh: ' + d.b_dob : ''}</p>
<p>Địa chỉ: ${d.b_address || ''}</p></div>
<div class="article"><p class="article-title">Điều 1. Công việc và địa điểm</p><div class="article-content">
<p>Chức danh: <b>${d.job_title || ''}</b></p><p>Địa điểm: ${d.work_location || ''}</p></div></div>
<div class="article"><p class="article-title">Điều 2. Thời hạn hợp đồng</p><div class="article-content">
<p>Loại: <b>${d.contract_type || ''}</b></p><p>Từ ngày: ${d.start_date || '...'}</p>
<p>Thử việc: ${d.probation || 60} ngày với mức lương 85% lương cơ bản.</p></div></div>
<div class="article"><p class="article-title">Điều 3. Tiền lương và phụ cấp</p><div class="article-content">
<p>Lương cơ bản: <b>${moneyFmt(d.salary || 0)} VNĐ/tháng</b></p>
<p>Phụ cấp: ${moneyFmt(d.allowance || 0)} VNĐ/tháng</p>
<p>Thanh toán lương vào ngày 05 và 20 hàng tháng qua chuyển khoản.</p></div></div>
<div class="article"><p class="article-title">Điều 4. Thời giờ làm việc</p><div class="article-content">
<p>${d.work_hours || ''}</p><p>Làm thêm giờ theo quy định của Bộ luật Lao động 2019.</p></div></div>
${renderClauses(cl, this.clauses)}
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blld2019', 'blds2015')}`;
    }
  },

  // 7. GIẤY ỦY QUYỀN
  {
    id: 'poa', icon: '📝', title: 'Giấy Ủy Quyền', desc: 'Giấy ủy quyền theo Bộ luật Dân sự 2015 (91/2015/QH13), Điều 138-143',
    fields: [
      ...partyFields.map(f => ({ ...f, section: f.section === 'Bên A' ? 'Bên ủy quyền' : f.section === 'Bên B' ? 'Bên được ủy quyền' : f.section })),
      { id: 'scope', label: 'Nội dung ủy quyền', type: 'textarea', required: true, section: 'Nội dung', placeholder: 'Đại diện ký kết hợp đồng mua bán...', full: true },
      { id: 'duration', label: 'Thời hạn ủy quyền', type: 'text', required: true, placeholder: 'Từ ngày... đến ngày... / Cho đến khi hoàn thành công việc' },
    ],
    clauses: [{ id: 'revoke', name: 'Thu hồi ủy quyền', preview: 'Điều kiện thu hồi', content: 'Bên ủy quyền có quyền thu hồi ủy quyền bất cứ lúc nào bằng văn bản thông báo. Việc thu hồi có hiệu lực kể từ khi Bên được ủy quyền nhận được thông báo.', checked: true }],
    render(d, cl) {
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>GIẤY ỦY QUYỀN</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015 (Điều 138-143 về đại diện và ủy quyền);</p>
${renderParty(d, 'a', 'BÊN ỦY QUYỀN:')}
${renderParty(d, 'b', 'BÊN ĐƯỢC ỦY QUYỀN:')}
<div class="article"><p class="article-title">NỘI DUNG ỦY QUYỀN</p><div class="article-content"><p>${d.scope || ''}</p></div></div>
<div class="article"><p class="article-title">THỜI HẠN ỦY QUYỀN</p><div class="article-content"><p>${d.duration || ''}</p></div></div>
<div class="article"><div class="article-content"><p>Bên được ủy quyền cam kết thực hiện đúng nội dung được ủy quyền và không được ủy quyền lại cho bên thứ ba (trừ trường hợp có sự đồng ý của Bên ủy quyền).</p></div></div>
${renderClauses(cl, this.clauses)}
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015')}`;
    }
  },

  // 8. BIÊN BẢN THANH LÝ HỢP ĐỒNG
  {
    id: 'liquidation', icon: '📋', title: 'Biên Bản Thanh Lý HĐ', desc: 'Biên bản thanh lý hợp đồng theo BLDS 2015 (91/2015/QH13)',
    fields: [
      ...partyFields,
      { id: 'contract_ref', label: 'Số hợp đồng thanh lý', type: 'text', required: true, section: 'Thông tin hợp đồng gốc', placeholder: 'HĐ-2026-001' },
      { id: 'contract_date', label: 'Ngày ký HĐ gốc', type: 'date', required: true },
      { id: 'contract_value', label: 'Giá trị HĐ gốc (VNĐ)', type: 'number', required: true, placeholder: '100000000' },
      { id: 'paid_amount', label: 'Đã thanh toán (VNĐ)', type: 'number', required: true, placeholder: '100000000' },
      { id: 'completion_note', label: 'Kết quả thực hiện', type: 'textarea', placeholder: 'Bên A đã hoàn thành đầy đủ nghĩa vụ...', full: true },
    ],
    clauses: [],
    render(d) {
      const remaining = (d.contract_value || 0) - (d.paid_amount || 0);
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>BIÊN BẢN THANH LÝ HỢP ĐỒNG</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
<p>Căn cứ Hợp đồng số <b>${d.contract_ref || ''}</b> ký ngày ${d.contract_date || '...'};</p>
${renderParty(d, 'a', 'BÊN A:')}
${renderParty(d, 'b', 'BÊN B:')}
<div class="article"><p class="article-title">Nội dung thanh lý</p><div class="article-content">
<p>1. Giá trị hợp đồng: <b>${moneyFmt(d.contract_value || 0)} VNĐ</b></p>
<p>2. Đã thanh toán: <b>${moneyFmt(d.paid_amount || 0)} VNĐ</b></p>
<p>3. Còn lại: <b>${moneyFmt(remaining)} VNĐ</b></p>
${d.completion_note ? `<p>4. Kết quả: ${d.completion_note}</p>` : ''}
<p>Hai bên xác nhận đã hoàn thành đầy đủ nghĩa vụ theo hợp đồng và không còn khiếu nại gì.</p>
</div></div>
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015')}`;
    }
  },

  // 9. BIÊN BẢN GIAO NHẬN
  {
    id: 'handover', icon: '🤲', title: 'Biên Bản Giao Nhận', desc: 'Biên bản bàn giao tài sản theo BLDS 2015 (91/2015/QH13)', hasItems: true,
    fields: [
      ...partyFields,
      { id: 'handover_reason', label: 'Lý do bàn giao', type: 'text', section: 'Thông tin bàn giao', placeholder: 'Bàn giao theo Hợp đồng số...', full: true },
      { id: 'handover_location', label: 'Địa điểm bàn giao', type: 'text', placeholder: 'Kho hàng, 789 Trần Hưng Đạo' },
      { id: 'handover_date', label: 'Ngày bàn giao', type: 'date', required: true },
      { id: 'condition_note', label: 'Tình trạng tài sản', type: 'textarea', placeholder: 'Tốt, đầy đủ, đúng số lượng...', full: true },
    ],
    clauses: [],
    render(d, _cl, items = []) {
      const rows = items.map((it, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${it.name || ''}</td><td style="text-align:center">${it.unit || ''}</td><td style="text-align:right">${it.qty || 0}</td><td>${it.note || 'Tốt'}</td></tr>`).join('');
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>BIÊN BẢN BÀN GIAO</h2><p class="doc-number">Ngày ${today()}</p>
<p style="text-indent:2em">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015;</p>
${d.handover_reason ? `<p>Căn cứ: ${d.handover_reason}</p>` : ''}
${renderParty(d, 'a', 'BÊN GIAO:')}
${renderParty(d, 'b', 'BÊN NHẬN:')}
<p>Địa điểm: ${d.handover_location || ''} | Ngày: ${d.handover_date || today()}</p>
<table><thead><tr><th>STT</th><th>Tên tài sản</th><th>ĐVT</th><th>SL</th><th>Tình trạng</th></tr></thead><tbody>${rows}</tbody></table>
${d.condition_note ? `<p><b>Ghi chú:</b> ${d.condition_note}</p>` : ''}
<p>Bên giao xác nhận đã bàn giao và Bên nhận xác nhận đã nhận đầy đủ.</p>
${renderSig(d.a_name || '', d.b_name || '')}
${renderLegalFooter('blds2015')}`;
    }
  },

  // 10. GIẤY BIÊN NHẬN
  {
    id: 'receipt', icon: '🧾', title: 'Giấy Biên Nhận', desc: 'Giấy xác nhận đã nhận tiền/tài sản theo BLDS 2015 (91/2015/QH13)',
    fields: [
      { id: 'receiver_name', label: 'Người nhận', type: 'text', required: true, section: 'Thông tin', placeholder: 'Nguyễn Văn A' },
      { id: 'receiver_id', label: 'CMND/CCCD', type: 'text', required: true, placeholder: '0123456789' },
      { id: 'payer_name', label: 'Người giao', type: 'text', required: true, placeholder: 'Trần Văn B' },
      { id: 'payer_id', label: 'CMND/CCCD người giao', type: 'text', placeholder: '0987654321' },
      { id: 'amount', label: 'Số tiền (VNĐ)', type: 'number', required: true, placeholder: '10000000' },
      { id: 'reason', label: 'Lý do', type: 'text', required: true, placeholder: 'Thanh toán tiền thuê nhà tháng 3/2026', full: true },
      { id: 'receipt_date', label: 'Ngày', type: 'date', required: true },
    ],
    clauses: [],
    render(d) {
      return `
<div class="doc-header-info"><p><b>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</b></p><p><b>Độc lập - Tự do - Hạnh phúc</b></p><p>———————</p></div>
<h2>GIẤY BIÊN NHẬN</h2><p class="doc-number">Ngày ${d.receipt_date || today()}</p>
<p style="text-indent:2em;font-size:0.9em;color:#555">Căn cứ Bộ luật Dân sự số 91/2015/QH13 ngày 24/11/2015</p>
<div class="article-content">
<p>Tôi tên: <b>${d.receiver_name || ''}</b></p>
<p>CMND/CCCD: ${d.receiver_id || ''}</p>
<p>Xác nhận đã nhận từ ông/bà: <b>${d.payer_name || ''}</b> (CMND/CCCD: ${d.payer_id || ''})</p>
<p>Số tiền: <b>${moneyFmt(d.amount || 0)} VNĐ</b></p>
<p>(Bằng chữ: ..............................................................................................)</p>
<p>Lý do: ${d.reason || ''}</p>
<p style="margin-top:1rem">Giấy biên nhận này được lập thành 02 bản, mỗi bên giữ 01 bản.</p>
</div>
${renderSig('Người nhận', 'Người giao')}
${renderLegalFooter('blds2015')}`;
    }
  },
];
