const main = () => {
    const params = Object.fromEntries(new URLSearchParams(window.location.search));
    const split = (key) => (params[key] || "").split(",").map(s => s.trim());

    const {
        products, quantity, unitpricelbp, unitpriceusd,
        customer, location, date, companyName, phoneNumber,
        totalLbp, target, totalusd, pagewidth, splitSubTotal,
        potsRemainingLarge, transId, potsRemainingMedium,
        amountPaid, amountPaidLbp, amountLeft, enablePots, enablePaidLeft
    } = params;

    const quantities = split("quantity");

    const prodArr = split("products").map((name, i) => {
        const lbpRaw = split("unitpricelbp")[i];
        const usdRaw = split("unitpriceusd")[i];
        return {
            name,
            quantity: quantities[i],
            unitpricelbp: splitSubTotal && parseInt(lbpRaw) ? (parseInt(lbpRaw) / parseInt(quantities[i])) : lbpRaw,
            unitpriceusd: splitSubTotal && parseFloat(usdRaw) ? (parseFloat(usdRaw) / parseInt(quantities[i])) : usdRaw,
        };
    });

    const $ = (id) => document.getElementById(id);

    // Company
    const cn = $("companyName");
    cn ? cn.innerHTML = companyName ? `${companyName} — INV# ${transId}` : "" : null;
    if (!companyName && cn) cn.remove();

    // Customer
    const cu = $("customer");
    if (cu) cu.innerHTML = [customer, location].filter(Boolean).join(" · ");

    // Date (hidden but safe)
    const dp = $("date");
    if (dp) dp.innerHTML = date || "";

    // Phone
    const ph = $("phoneNumber");
    if (ph) { phoneNumber ? ph.innerHTML = phoneNumber : ph.remove(); }

    // Pots
    const ps = $("potsSection");
    if (!enablePots && ps) { ps.remove(); }
    else {
        const pl = $("potsRemainingLarge");
        const pm = $("potsRemainingMedium");
        if (pl) pl.innerHTML = (potsRemainingLarge || 0) + "L";
        if (pm) pm.innerHTML = (potsRemainingMedium || 0) + "M";
    }

    // Paid/Left
    const pls = $("paidLeftSection");
    if (!enablePaidLeft && pls) { pls.remove(); }
    else {
        const ap = $("amountPaid");    if (ap) ap.innerHTML = amountPaid || 0;
        const al = $("amountPaidLbp"); if (al) al.innerHTML = amountPaidLbp || 0;
        const alf = $("amountLeft");   if (alf) alf.innerHTML = amountLeft || 0;
    }

    // Totals & columns
    const lbpCol = $("lbpColumn"), usdCol = $("usdColumn");
    const lbpRow = $("lbpTotalRow"), usdRow = $("usdTotalRow");
    const tlbp = $("totalpricelbp"), tusd = $("totalpriceusd");

    if (target === "LBP") {
        if (usdCol) usdCol.remove();
        if (usdRow) usdRow.remove();
        if (tlbp) tlbp.innerHTML = totalLbp;
    } else if (target === "USD") {
        if (lbpCol) lbpCol.remove();
        if (lbpRow) lbpRow.remove();
        if (tusd) tusd.innerHTML = totalusd;
    } else {
        if (tlbp) tlbp.innerHTML = totalLbp;
        if (tusd) tusd.innerHTML = totalusd;
    }

    // Ticket width - force 58mm if not specified
    const ticket = $("ticket");
    const targetWidth = pagewidth || "58mm";
    
    if (ticket) {
        ticket.style.width = targetWidth;
        ticket.style.maxWidth = targetWidth;
        ticket.style.minWidth = targetWidth;
    }
    
    // Force body and html width
    document.body.style.width = targetWidth;
    document.body.style.minWidth = targetWidth;
    document.body.style.maxWidth = targetWidth;
    document.documentElement.style.width = targetWidth;
    document.documentElement.style.minWidth = targetWidth;
    document.documentElement.style.maxWidth = targetWidth;

    // Rows
    const tbody = $("tableBod");
    prodArr.forEach(({ quantity, name, unitpricelbp, unitpriceusd }) => {
        tbody.innerHTML += `<tr>
            <td class="qty">${quantity}</td>
            <td class="desc">${name}</td>
            ${target !== "USD" ? `<td class="price">${unitpricelbp}</td>` : ""}
            ${target !== "LBP" ? `<td class="price">${unitpriceusd}</td>` : ""}
        </tr>`;
    });

    // Update viewport meta for print
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=58mm, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
    
    // Add a style element to enforce width during print
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        @media print {
            @page { size: ${targetWidth} auto; margin: 0; }
            html, body { width: ${targetWidth} !important; min-width: ${targetWidth} !important; max-width: ${targetWidth} !important; }
        }
    `;
    document.head.appendChild(styleEl);

    // Create iframe for printing to bypass browser scaling
    setTimeout(() => {
        const ticketContent = document.getElementById('ticket').outerHTML;
        const styles = document.querySelector('style') ? document.querySelector('style').outerHTML : '';
        const allStyles = document.querySelectorAll('style');
        let allStylesContent = '';
        allStyles.forEach(style => {
            allStylesContent += style.outerHTML;
        });
        
        // Get the linked stylesheet content
        const linkedStyles = document.querySelector('link[rel="stylesheet"]');
        let linkedStylesHref = '';
        if (linkedStyles) {
            linkedStylesHref = linkedStyles.href;
        }
        
        const printWindow = window.open('', '_blank', 'width=250,height=800');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=58mm, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <link rel="stylesheet" href="${linkedStylesHref}">
                <style>
                    @page { 
                        size: ${targetWidth} auto; 
                        margin: 0; 
                    }
                    
                    html, body { 
                        width: ${targetWidth} !important; 
                        min-width: ${targetWidth} !important;
                        max-width: ${targetWidth} !important;
                        margin: 0 !important; 
                        padding: 0 !important;
                    }
                    
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 10px;
                        background: #fff;
                    }
                    
                    .ticket {
                        width: ${targetWidth} !important;
                        min-width: ${targetWidth} !important;
                        max-width: ${targetWidth} !important;
                        padding: 4px 6px 8px 6px;
                    }
                    
                    ${allStylesContent}
                </style>
            </head>
            <body>
                ${ticketContent}
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        // Wait for content to load then print
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 500);
        }, 500);
    }, 300);
};

main();
