function loadScript(src) {
    return new Promise(function(resolve, reject) {
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
        body.push([ productName, productPrice + " ₪", productNotes ]);
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
    html2pdf().set(opt).from(document.getElementById('proposal-container')).toPdf().get('pdf').then(function(pdf) {
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
5. תרגום (אופציונלי) – במידה ונד
