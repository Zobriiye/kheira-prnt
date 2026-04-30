const main = () => {
    window.jsPDF = window.jspdf.jsPDF
    const parameters = new URLSearchParams(window.location.search);
    let params = {};
    const cleanUpData = (key) => {
        return key.split(",").map((ind) => ind.trim());
    };
    for (var value of parameters.keys()) {
        params[value] = parameters.get(value);
    }

    const {
        products,
        quantity,
        unitpriceusd,
        customer,
        location,
        date, companyName, phoneNumber,
        totalLbp, target,
        totalusd, pagewidth, savePdf, splitSubTotal, potsRemainingLarge, transId,
        potsRemainingMedium, enablePots
    } = params;

    const prodArr = [];
    cleanUpData(products).forEach((name) => prodArr.push({ name }));
    const quantities = cleanUpData(quantity);
    quantities.forEach((quantity, i) => (prodArr[i].quantity = quantity));

    cleanUpData(unitpriceusd).forEach((usdVal, i) => {
        if (!splitSubTotal) {
            prodArr[i].unitpriceusd = usdVal;
            prodArr[i].subtotalusd = usdVal;
        } else {
            const subtotal = parseFloat(usdVal);
            const qty = parseInt(quantities[i]);
            prodArr[i].unitpriceusd = subtotal !== 0 ? (subtotal / qty).toFixed(2) : 0;
            prodArr[i].subtotalusd = subtotal !== 0 ? subtotal.toFixed(2) : 0;
        }
    });

    const potsRemainingLargePart = document.querySelector("#potsRemainingLarge");
    const potsRemainingMediumPart = document.querySelector("#potsRemainingMedium");
    const totalpricelbpPart = document.querySelector("#totalpricelbp");
    const totalpriceusdPart = document.querySelector("#totalpriceusd");
    const potsSection = document.querySelector("#potsSection");

    potsRemainingLargePart.innerHTML = (potsRemainingLarge ? potsRemainingLarge : 0) + ' L';
    potsRemainingMediumPart.innerHTML = (potsRemainingMedium ? potsRemainingMedium : 0) + ' M';

    if (enablePots === undefined || enablePots === "") {
        potsSection.remove();
    }

    totalpriceusdPart.innerHTML = totalusd;
    totalpricelbpPart.innerHTML = totalLbp;

    const companyNamePart = document.querySelector("#companyName");
    if (!companyName) {
        companyNamePart.remove();
    } else {
        companyNamePart.innerHTML = companyName + "      (INV# " + transId + ")";
    }

    const phoneNumberPart = document.querySelector("#phoneNumber");
    if (!phoneNumber) {
        phoneNumberPart.remove();
    } else {
        phoneNumberPart.innerHTML = phoneNumber;
    }

    document.querySelector("#customer").innerHTML = customer + ", " + location;

    const datePart = document.querySelector("#date");
    datePart.innerHTML = date;

    const tableBody = document.querySelector("#tableBod");
    prodArr.forEach((product) => {
        tableBody.innerHTML += '<tr>' +
            '<td class="quantity">' + product.quantity + '</td>' +
            '<td class="description">' + product.name + '</td>' +
            '<td class="price">' + product.unitpriceusd + '</td>' +
            '<td class="price">' + product.subtotalusd + '</td>' +
            '</tr>';
    });

    const ticket = document.querySelector("#ticket");
    ticket.style.maxWidth = pagewidth;
    ticket.style.width = pagewidth;
    var doc = new jsPDF(ticket.clientHeight < ticket.clientWidth ? "l" : "p", "px", [ticket.clientHeight, ticket.clientWidth]);
    doc.html(ticket, {
        callback: function (doc) {
            const base64Full = doc.output('datauri');
            if (savePdf) doc.save();
            document.location.href =
                "rawbt:data:application/pdf;base64," + base64Full.split("base64,")[1];
        }
    });
};
main();
