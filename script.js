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

async function exportPDF() {
    console.log("exportPDF called");
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
    });
}

function generateHTML() {
    const companyName = document.getElementById('companyName').value;
    const contactName = document.getElementById('contactName').value;
    const contactPosition = document.getElementById('contactPosition').value;
    const paymentTerms = document.getElementById('paymentTerms').value;
    const pricingTable = document.getElementById('pricingTable').outerHTML;

    const proposalHTML = `
        <h1>הצעת מחיר עבור ${companyName}</h1>
        <p>איש קשר: ${contactName}</p>
        <p>תפקיד: ${contactPosition}</p>
        ${pricingTable}
        <h2>תנאי תשלום:</h2>
        <p>${paymentTerms}</p>
    `;

    document.getElementById('proposal-container').innerHTML = proposalHTML;
}

let signaturePad;

function initSignaturePad() {
    const canvas = document.getElementById('signature-pad');
    signaturePad = new SignaturePad(canvas);
}

function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
    }
}

window.onload = function() {
    initSignaturePad();
};
