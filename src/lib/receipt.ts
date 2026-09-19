export function generateReceiptHTML(p: any, s: any) {
  const studentName = s?.name || '—';
  const studentClass = s?.class || '—';
  const matricule = s?.matricule || '—';
  const dateStr = p.date || new Date().toLocaleDateString('fr-FR');

  const isSecondYear = /^ASB[2-3]|^LSI[2-3]|^LSO[2-3]|^LBM[2-3]/.test(studentClass);
  const isThirdYear = /^ASB3|^LSI3|^LSO3|^LBM3/.test(studentClass);

  const frozenPaids = s?.frozenPaids as Record<string, number> | undefined;
  const frozenRests = s?.frozenRests as Record<string, number> | undefined;

  let year1Versement = 0;
  let year1Reste = 0;
  let year2Versement = 0;
  let year2Reste = 0;

  if (isSecondYear || isThirdYear) {
    year1Versement = frozenPaids?.['1ère année'] || frozenPaids?.['1ere annee'] || 0;
    year1Reste = frozenRests?.['1ère année'] || frozenRests?.['1ere annee'] || 0;
    year2Versement = p.amount || 0;
    const currentTariff = (s?.annualTuition || 0) > 0 ? s.annualTuition : 0;
    year2Reste = currentTariff > 0 ? Math.max(0, currentTariff - year2Versement) : 0;
  } else {
    year1Versement = p.amount || 0;
    const due = (s?.annualTuition || 0) > 0 ? s.annualTuition : 0;
    year1Reste = due > 0 ? Math.max(0, due - year1Versement) : 0;
  }

  const totalVersement = year1Versement + year2Versement;
  const totalReste = year1Reste + year2Reste;

  // Black & White / Grayscale design for reliable printing
  const dnaLogo = `<svg width="75" height="95" viewBox="0 0 75 95" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="helixGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#333333"/>
        <stop offset="50%" style="stop-color:#666666"/>
        <stop offset="100%" style="stop-color:#333333"/>
      </linearGradient>
      <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#444444"/>
        <stop offset="50%" style="stop-color:#777777"/>
        <stop offset="100%" style="stop-color:#444444"/>
      </linearGradient>
    </defs>
    <path d="M37 5 C12 18, 12 38, 37 52 C62 66, 62 86, 37 90" stroke="url(#helixGrad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M37 5 C62 18, 62 38, 37 52 C12 66, 12 86, 37 90" stroke="url(#helixGrad)" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <line x1="22" y1="18" x2="52" y2="18" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <line x1="18" y1="28" x2="56" y2="28" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <line x1="18" y1="42" x2="56" y2="42" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <line x1="22" y1="52" x2="52" y2="52" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <line x1="14" y1="68" x2="60" y2="68" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <line x1="14" y1="78" x2="60" y2="78" stroke="url(#barGrad)" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="37" cy="48" rx="8" ry="4" fill="rgba(100,100,100,0.3)" transform="rotate(-20 37 48)"/>
    <ellipse cx="37" cy="22" rx="6" ry="3" fill="rgba(100,100,100,0.2)" transform="rotate(-20 37 22)"/>
  </svg>`;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Reçu ${p.receipt}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Georgia", "Times New Roman", serif;
    background: #ffffff;
    color: #000000;
    width: 210mm;
    height: 99mm;
    padding: 5mm 10mm;
    overflow: hidden;
    position: relative;
  }
  .receipt {
    width: 100%;
    height: 100%;
    position: relative;
  }
  .receipt::before {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    background-image:
      linear-gradient(45deg, transparent 48%, rgba(0,0,0,0.015) 49%, rgba(0,0,0,0.015) 51%, transparent 52%),
      linear-gradient(-45deg, transparent 48%, rgba(0,0,0,0.015) 49%, rgba(0,0,0,0.015) 51%, transparent 52%);
    background-size: 25px 25px;
    pointer-events: none;
    z-index: 0;
  }
  .content { position: relative; z-index: 1; }

  .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2.5mm; }
  .logo-section { display: flex; align-items: flex-start; gap: 4px; }
  .logo-text-block { line-height: 1.05; margin-top: 2px; }
  .logo-text-block .iph {
    font-size: 26px;
    font-weight: bold;
    color: #000000;
    letter-spacing: 2px;
  }
  .logo-text-block .sub {
    font-size: 6.5px;
    color: #333333;
    line-height: 1.2;
    letter-spacing: 0.3px;
  }

  .header-right { text-align: right; max-width: 55%; }
  .header-right .title {
    font-size: 13px;
    font-weight: bold;
    color: #000000;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }
  .header-right .decret {
    font-size: 6.5px;
    color: #000000;
    line-height: 1.35;
    margin-top: 2px;
    font-weight: 500;
  }

  .niamey-bar {
    background: #000000;
    color: #ffffff;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 3px;
    padding: 2.5px 0;
    margin-bottom: 2.5mm;
    border-radius: 1px;
  }

  .recu-title {
    text-align: center;
    font-size: 42px;
    font-weight: bold;
    color: #000000;
    letter-spacing: 6px;
    margin-bottom: 2.5mm;
    line-height: 1;
    text-shadow: 1px 1px 0px rgba(0,0,0,0.1);
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 2.5mm;
    font-size: 10px;
    color: #000000;
    gap: 6px;
  }
  .info-label {
    font-weight: bold;
    color: #000000;
    white-space: nowrap;
  }
  .info-value {
    font-weight: bold;
    flex: 1;
    border-bottom: 1px dotted #000000;
    text-align: center;
    padding: 0 4px;
    min-width: 40px;
  }
  .info-sep { width: 12px; }

  .recu-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    margin-bottom: 2mm;
    font-size: 10px;
    border-radius: 6px;
    overflow: hidden;
  }
  .recu-table th {
    background: #000000;
    color: #ffffff;
    border: 1px solid #000000;
    padding: 4px 6px;
    text-align: center;
    font-weight: bold;
    font-size: 10px;
  }
  .recu-table td {
    border: 1px solid #000000;
    padding: 4px 6px;
    text-align: center;
    font-size: 10px;
    color: #000000;
    background: #ffffff;
  }
  .recu-table td:first-child {
    text-align: center;
    font-weight: bold;
    width: 6%;
    background: #f5f5f5;
  }
  .recu-table td:nth-child(2) {
    text-align: left;
    font-weight: bold;
    width: 34%;
  }
  .recu-table td.total-gold {
    background: #e0e0e0;
    font-weight: bold;
    color: #000000;
  }
  .recu-table td.total-gray {
    background: #d0d0d0;
    font-weight: bold;
    color: #000000;
  }
  .recu-table td.empty {
    background: #fafafa;
    color: #999;
  }

  .conservation-bar {
    background: #333333;
    color: #ffffff;
    text-align: center;
    font-size: 9.5px;
    font-weight: bold;
    letter-spacing: 1.5px;
    padding: 3px 0;
    margin-bottom: 2mm;
    border: 1px solid #000000;
    border-radius: 3px;
  }

  .footer { font-size: 7.5px; color: #000000; line-height: 1.4; }
  .footer .nb { font-weight: bold; }
  .footer-row { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 1px; }
  .footer-row span { white-space: nowrap; }

  @media print {
    body { width: 210mm; height: 99mm; padding: 5mm 10mm; }
    .niamey-bar { background: #000000 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .recu-table th { background: #000000 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .recu-table td.total-gold { background: #e0e0e0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .recu-table td.total-gray { background: #d0d0d0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .recu-table td:first-child { background: #f5f5f5 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    .conservation-bar { background: #333333 !important; color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
</style></head>
<body>
<div class="receipt">
  <div class="content">
    <div class="header">
      <div class="logo-section">
        ${dnaLogo}
        <div class="logo-text-block">
          <div class="iph">IPHES</div>
          <div class="sub">Institut Prive des Hautes<br>Etudes de la Sante</div>
        </div>
      </div>
      <div class="header-right">
        <div class="title">Institut Prive des Hautes Etudes de la Sante</div>
        <div class="decret">
          <b>LOI/DECRET/ARRETE DE CREATION :</b> N° 123/MESR/NSG/DGE/DL/DESP/DESPRI DU 29 DEC 2010<br>
          <b>ARRETE D'OUVERTURE (PRIVE) :</b> N°0104/MESR/SG/DGE/DL/DESPR1 DU 23 SEP 2018
        </div>
      </div>
    </div>

    <div class="niamey-bar">NIAMEY, NIGER</div>

    <div class="recu-title">REÇU</div>

    <div class="info-row">
      <span class="info-label">Nom et Prenom:</span>
      <span class="info-value">${studentName}</span>
      <span class="info-sep"></span>
      <span class="info-label">Date:</span>
      <span class="info-value">${studentClass}</span>
      <span class="info-sep"></span>
      <span class="info-value">${dateStr}</span>
    </div>

    <table class="recu-table">
      <thead>
        <tr>
          <th>N°</th>
          <th>Rubriques</th>
          <th>1eme annee</th>
          <th>2eme annee</th>
          <th>total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Versement</td>
          <td>${year1Versement > 0 ? year1Versement.toLocaleString('fr-FR') + ' F' : (isSecondYear ? '0 F' : '')}</td>
          <td>${year2Versement > 0 ? year2Versement.toLocaleString('fr-FR') + ' F' : (isSecondYear ? '0 F' : '')}</td>
          <td class="total-gold">${totalVersement.toLocaleString('fr-FR')} F</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Reste a payer</td>
          <td>${year1Reste > 0 ? year1Reste.toLocaleString('fr-FR') + ' F' : (isSecondYear ? '0 F' : '')}</td>
          <td>${year2Reste > 0 ? year2Reste.toLocaleString('fr-FR') + ' F' : (isSecondYear ? '0 F' : '')}</td>
          <td class="total-gray">${totalReste.toLocaleString('fr-FR')} F</td>
        </tr>
      </tbody>
    </table>

    <div class="conservation-bar">A CONSERVER SANS LIMITATION DE DUREE</div>

    <div class="footer">
      <div class="nb">NB: Le present recu n est valable qu avec le cachet et la signature du mandataire</div>
      <div>La somme versee n est pas remboursable</div>
      <div class="footer-row">
        <span><b>N° du recu :</b> ${p.receipt}</span>
        <span><b>Motif 1 :</b> ${p.reason} ${p.year ? '— ' + p.year : ''} — ${(p.amount || 0).toLocaleString('fr-FR')} F</span>
      </div>
      <div class="footer-row">
        <span><b>Mode :</b> ${p.mode}</span>
        <span><b>Matricule :</b> ${matricule}</span>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

export function openPrintWindow(html: string) {
  const w = window.open('', '_blank');
  if (w) { w.document.write(html); w.document.close(); w.print(); }
}
