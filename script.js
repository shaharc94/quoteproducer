function loadScript(src) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function addProduct() {
    const productContainer = document.getElementById("products");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td><input type="text" placeholder="רכיב" class="product-name"></td>
        <td><input type="number" placeholder="עלות" class="product-price"></td>
        <td><input type="text" placeholder="הערות" class="product-notes"></td>
    `;
    productContainer.appendChild(row);
}

function generatePricingTableRowsForPdf() {
    const body = [];
    // כותרת הטבלה
    body.push([
        { text: 'רכיב', style: 'tableHeader' },
        { text: 'עלות', style: 'tableHeader' },
        { text: 'הערות', style: 'tableHeader' }
    ]);
    const productRows = document.querySelectorAll("#products tr");
    productRows.forEach(row => {
        const productName = row.querySelector('.product-name')?.value || '-';
        const productPrice = row.querySelector('.product-price')?.value || '0';
        const productNotes = row.querySelector('.product-notes')?.value || '-';
        body.push([productName, productPrice + " ₪", productNotes]);
    });
    return body;
}

// exportPDF – פונקציה המייצאת את ההצעה כקובץ PDF
async function exportPDF() {
    console.log("exportPDF called");
    // טוענים את html2pdf אם אינה קיימת
    if (typeof html2pdf === 'undefined') {
        try {
            console.log("html2pdf not defined, loading script...");
            await loadScript("https://unpkg.com/html2pdf.js@0.9.3/dist/html2pdf.bundle.min.js");
            console.log("html2pdf loaded successfully");
        } catch (err) {
            console.error("Failed to load html2pdf", err);
            return;
        }
    }

    const btns = document.querySelectorAll('.signature-buttons.export');
    btns.forEach(btn => btn.style.display = 'none');

    const opt = {
        margin: 0.5,
        filename: 'הצעת_מחיר_' + Date.now() + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    console.log("Generating PDF with options:", opt);
    html2pdf().set(opt).from(document.getElementById('proposal-container')).toPdf().get('pdf').then(function (pdf) {
        if (pdf.setR2L) {
            pdf.setR2L(true);
        }
    }).save().then(() => {
        console.log("PDF saved successfully");
        btns.forEach(btn => btn.style.display = '');
    });
}

// דוגמה לשימוש ב-pdfmake (ניתן להשתמש בזה במקום exportPDF, ודאו שהספריות נטענות ב-index.html)
function generatePDFWithPdfmake() {
    const companyName = document.getElementById('companyName').value;
    const contactName = document.getElementById('contactName').value;
    const contactPosition = document.getElementById('contactPosition').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    const currentDate = new Date().toLocaleDateString('he-IL');
    const proposalYear = new Date().getFullYear();

    const processText =
        `1. התאמת התוכן – הלומדה תותאם בהתאם להערות שיסופקו (כולל שינויי טקסט, הוספת לוגו ושם הלקוח ${companyName}).
2. שלב ראשון – הטמעת ההתאמות בלומדת המדף ותיקוף ראשוני.
3. שלב שני – ביצוע תיקונים בהתאם למשוב, ולאחר מכן תיקוף סופי לקבלת אישור.
4. קריינות (אופציונלי) – במידה ונדרש.
5. תרגום (אופציונלי) – במידה ונדרש.`;

    const pricingRows = generatePricingTableRowsForPdf();

    const docDefinition = {
        defaultStyle: { alignment: 'right' },
        content: [
            { text: 'הצעת מחיר למוצרי הדרכה דיגיטליים עבור ' + companyName, style: 'header', alignment: 'center' },
            { text: `לכבוד: ${companyName}`, style: 'subheader' },
            { text: `איש קשר: ${contactName}`, style: 'subheader' },
            { text: `תפקיד: ${contactPosition}`, style: 'subheader' },
            { text: `תאריך: ${currentDate}`, style: 'subheader' },
            { text: 'פרופיל חברה', style: 'sectionHeader' },
            { text: 'Improve-IT הוקמה בשנת 2010 על ידי זיו גלבוע, מומחה בעל ניסיון ניהולי וייעוצי.', style: 'body' },
            { text: 'רקע', style: 'sectionHeader' },
            { text: `${companyName} שוקלת לשלב לומדות מדף במערכת LMS בשנת ${proposalYear}.`, style: 'body' },
            { text: 'הפתרון המוצע - כללי', style: 'sectionHeader' },
            { text: `הפתרון מתמקד בלומדות מדף ייעודיות לכלל עובדי ${companyName}.`, style: 'body' },
            { text: 'תהליך העבודה המוצע', style: 'sectionHeader' },
            { text: processText, style: 'body' },
            { text: 'תמחור ותכולת ההצעה', style: 'sectionHeader' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', 'auto', '*'],
                    body: pricingRows
                },
                layout: 'lightHorizontalLines'
            },
            { text: 'תנאי תשלום', style: 'sectionHeader' },
            { text: paymentTerms, style: 'body' },
            { text: 'תנאים כלליים', style: 'sectionHeader' },
            { text: 'כל התוצרים ימסרו בפורמטים דיגיטליים בלבד. ההצעה אינה כוללת הוצאה לאור.\nניהול הפרויקט יתבצע מול נקודת קשר מרכזית (POC).\nהצעה זו תקפה ל-30 ימים.\nImprove-IT אינה אחראית לנזקים ישירים או עקיפים.\nבמקרה של ביטול, יחולו תנאים (למשל, ביטול לפני תחילת העבודה יחייב 30% מסך המחיר).', style: 'body' },
            { text: 'אישור ההצעה', style: 'sectionHeader' },
            { text: 'אני מאשר/ת את הסכמתי לתנאים.', style: 'body' },
            { text: 'שם: ___________________________', style: 'body' },
            { text: `תאריך: ${currentDate}`, style: 'body' },
            { text: 'חתימה דיגיטלית:', style: 'body', alignment: 'center' },
            signatureData ? { image: signatureData, width: 200, alignment: 'center', margin: [0, 10, 0, 0] }
                : { text: '__________', alignment: 'center', margin: [0, 20, 0, 0] }
        ],
        styles: {
            header: { fontSize: 28, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 16, margin: [0, 2, 0, 2] },
            sectionHeader: { fontSize: 20, bold: true, margin: [0, 10, 0, 5] },
            body: { fontSize: 14, margin: [0, 2, 0, 2] },
            tableHeader: { bold: true, fontSize: 14, color: 'black' }
        }
    };

    pdfMake.createPdf(docDefinition).download(`הצעת_מחיר_${Date.now()}.pdf`);
}

function generateHTML() {
    if (!confirm("האם ברצונך להוריד את ההצעה כקובץ HTML?")) return;

    let signatureData = "";
    if (typeof signaturePad !== "undefined" && !signaturePad.isEmpty()) {
        signatureData = signaturePad.toDataURL();
    }

    const companyName = document.getElementById('companyName').value;
    const contactName = document.getElementById('contactName').value;
    const contactPosition = document.getElementById('contactPosition').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    const currentDate = new Date().toLocaleDateString('he-IL');
    const proposalYear = new Date().getFullYear();

    const pricingSection = `
        <h2>תמחור ותכולת ההצעה</h2>
        <table>
            <thead>
                <tr>
                    <th>רכיב</th>
                    <th>עלות</th>
                    <th>הערות</th>
                </tr>
            </thead>
            <tbody>
                ${
        document.querySelectorAll("#products tr").length
            ? Array.from(document.querySelectorAll("#products tr")).map(row => {
                const productName = row.querySelector('.product-name')?.value || '-';
                const productPrice = row.querySelector('.product-price')?.value || '0';
                const productNotes = row.querySelector('.product-notes')?.value || '-';
                return `<tr>
                                <td>${productName}</td>
                                <td>${productPrice} ₪</td>
                                <td>${productNotes}</td>
                            </tr>`;
            }).join('')
            : '<tr><td colspan="3">אין פרטי תמחור</td></tr>'
        }
            </tbody>
        </table>
    `;

    const processSection = `
        <h2>תהליך העבודה המוצע</h2>
        <ol>
            <li>התאמת התוכן – הלומדה תותאם בהתאם להערות שיסופקו 
                <span class="ltr">(כולל שינויי טקסט, הוספת לוגו ושם הלקוח (${companyName}))</span>.</li>
            <li>שלב ראשון – הטמעת ההתאמות בלומדת המדף ותיקוף ראשוני.</li>
            <li>שלב שני – ביצוע תיקונים בהתאם למשוב, ולאחר מכן תיקוף סופי לקבלת אישור.</li>
            <li>קריינות <span class="ltr">(אופציונלי)</span> – במידה ונדרש, לאחר אישור הלומדה תבוצע קריינות והטמעתה.</li>
            <li>תרגום <span class="ltr">(אופציונלי)</span> – במידה ונדרש, תתבצע תרגום והטמעתו לאחר תיקוף סופי.</li>
        </ol>
    `;

    const generalTerms = `
        <h2>תנאים כלליים</h2>
        <ul>
            <li>כל התוצרים ימסרו בפורמטים דיגיטליים בלבד. ההצעה אינה כוללת הוצאה לאור.</li>
            <li>ניהול הפרויקט יתבצע מול נקודת קשר מרכזית <span class="ltr">(POC)</span> שתפקח על העברת החומרים.</li>
            <li>הצעה זו תקפה ל-30 ימים והעבודה תחל לאחר קבלת הזמנת עבודה רשמית, לפחות 20 ימי עסקים לפני תחילת הפרויקט.</li>
            <li><span class="brand">Improve-IT</span> אינה אחראית לנזקים ישירים או עקיפים; סך החבות מוגבל לסכום שהתמורה ששולמה.</li>
            <li>במקרה של ביטול, יחולו תנאים כפי שיפורטו בהצעה 
                <span class="ltr">(למשל, ביטול לפני תחילת העבודה יחייב 30% מסך המחיר)</span>.</li>
        </ul>
    `;

    const signatureSection = `
        <h2>אישור ההצעה</h2>
        <p>אני מאשר/ת את הסכמתי לתנאים המפורטים בהצעה זו.</p>
        <p><strong>שם:</strong> <input type="text" id="signature-name" placeholder="הכנס את שמך כאן"></p>
        <p><strong>תאריך:</strong> <input type="text" id="signature-date" readonly></p>
        <div class="signature">
            <p><strong>חתימה דיגיטלית:</strong></p>
            ${
        signatureData
            ? `<img src="${signatureData}" alt="חתימה דיגיטלית" style="max-width:400px; border:1px solid #ddd; border-radius:4px;">`
            : `<canvas id="signature-pad" width="400" height="150"></canvas>`
        }
            <div class="signature-buttons export">
                <button onclick="clearSignature()">נקה חתימה</button>
                <button onclick="exportPDF()">הורד את ההצעה</button>
            </div>
        </div>
    `;

    if (document.getElementById('signature-date')) {
        document.getElementById('signature-date').value = new Date().toLocaleDateString('he-IL');
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>הצעת מחיר</title>
    <script src="https://unpkg.com/html2pdf.js@0.9.3/dist/html2pdf.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js"></script>
    <script>
        function loadScript(src) {
            return new Promise(function(resolve, reject) {
                var script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Helvetica:wght@400;500;700&display=swap');
        html, body {
            font-family: Helvetica, Arial, sans-serif;
            direction: rtl;
            text-align: right;
            unicode-bidi: bidi-override;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            color: #333;
            letter-spacing: 0.5px;
            -webkit-font-smoothing: antialiased;
            text-rendering: optimizeLegibility;
        }
        .proposal-container {
            max-width: 900px;
            margin: auto;
            background: #fff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 6px 16px rgba(0,0,0,0.15);
            direction: rtl;
            text-align: right;
            unicode-bidi: bidi-override;
        }
        .header {
            background-color: #DAF22A;
            padding: 30px;
            text-align: center;
            color: #333;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            border-bottom: 2px solid rgba(0,0,0,0.1);
            padding-bottom: 10px;
        }
        .brand {
            font-weight: 700;
            letter-spacing: 0.05em;
            direction: ltr;
            unicode-bidi: embed;
        }
        .content {
            padding: 30px 40px;
            line-height: 1.8;
        }
        .content h2 {
            color: #2c3e50;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 8px;
            margin-top: 30px;
            font-size: 24px;
        }
        .content p, .content li {
            font-size: 16px;
            margin: 10px 0;
        }
      
