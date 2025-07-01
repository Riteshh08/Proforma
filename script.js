let productCount = 0;
const qrImagePath = "qr-code.png"; // Local path

doc.addFont("NotoSans-Regular-normal.ttf", "NotoSans", "normal");
doc.setFont("NotoSans"); // Use the font that supports ₹

function addProduct() {
  productCount++;
  const container = document.getElementById("products");
  const div = document.createElement("div");
  div.className = "row";
  div.innerHTML = `
    <div><label>Product</label><select id="product${productCount}">
      <option value="UMBRELLA">UMBRELLA</option>
      <option value="GAZEBO">GAZEBO</option>
      <option value="PROMO TABLE">PROMO TABLE</option>
      <option value="CANOPY">CANOPY</option>
      <option value="TRANSPORT CHARGES">TRANSPORT CHARGES</option>
    </select></div>
    <div><label>Qty</label><input type="number" id="qty${productCount}" value="1" /></div>
    <div><label>Rate</label><input type="number" id="rate${productCount}" value="0" /></div>
  `;
  container.appendChild(div);
}

function getProducts() {
  const rows = [];
  for (let i = 1; i <= productCount; i++) {
    const desc = document.getElementById(`product${i}`).value;
    const qty = +document.getElementById(`qty${i}`).value;
    const rate = +document.getElementById(`rate${i}`).value;
    const amt = qty * rate;
    rows.push([
      i.toString(),
      desc,
      qty.toString(),
      ` ${rate.toFixed(2)}`,
      ` ${amt.toFixed(2)}`
    ]);
  }
  return rows;
}

async function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let x = 15, y = 10;

  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("PROFORMA", 105, y, { align: "center" });

  const logo = new Image();
  logo.src = "logo.png"; // Local path or base64

  logo.onload = function () {
    doc.addImage(logo, "PNG", x, y + 5, 15, 20); // x=15, y=20 adjusted

    doc.setFontSize(14);
    doc.text("SHREE DATTA TRUNK & UMBRELLA MART", 105, y + 10, { align: "center" });

    doc.setFontSize(10);
    doc.text("1099,BUDHWAR PETH, NEXT TO DATTA MANDIR, PUNE 411002", 105, y + 18, { align: "center" });
    doc.text("Phone: +91- 93729 49460 | Email: sales@anchorumbrella.com", 105, y + 23, { align: "center" });

  const inputDate = document.getElementById("date").value; // e.g., "2025-07-01"
  const dateObj = new Date(inputDate);

  // Format to dd/mm/yyyy
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = dateObj.getFullYear();

  const formattedDate = `${day}/${month}/${year}`;

  doc.text(`Date: ${formattedDate}`, 160, y + 30);

  y += 40;
  doc.setFontSize(12);
  doc.setFont("times", "normal");
  doc.text("To,", x, y);
  doc.text("M/s: " + document.getElementById("name").value, x, y + 7);
  doc.text("Address: " + document.getElementById("address").value, x, y + 14);
  doc.text("Mobile: " + document.getElementById("mobile").value, x, y + 21);
  doc.text("GST No: " + document.getElementById("gst").value, x, y + 28);

  y += 35;
  const products = getProducts();

  const subtotal = products.reduce((sum, row) => sum + parseFloat(row[4].replace(/[₹,]/g, "")), 0);
  
  const gstRate = parseFloat(document.getElementById("gstRate").value) || 0;
  const gst = subtotal * (gstRate / 100);
  
  const total = subtotal + gst;

  products.push([
    { content: "Subtotal", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
    { content: `Rs. ${subtotal.toFixed(2)}` }
  ]);
  
  products.push([
    { content: `GST (${gstRate}%)`, colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
    { content: `Rs. ${gst.toFixed(2)}` }
  ]);
  
  products.push([
    { content: "Total", colSpan: 4, styles: { halign: "right", fontStyle: "bold" } },
    { content: `Rs. ${Math.round(total).toLocaleString("en-IN")}` }
  ]);

doc.autoTable({
  startY: y,
  head: [["Sr No", "Description", "Qty", "Rate", "Amount"]],
  body: products,
  styles: { font: "times", fontSize: 11 },
  headStyles: {
    fillColor: [220, 220, 220],
    textColor: 0,
    fontStyle: "bold",
  },
  theme: "grid",
  margin: { left: x, right: x }
});


  y = doc.lastAutoTable.finalY + 10;

  const advance = document.getElementById("advance").value;
  const transport = document.getElementById("transport").value;

  doc.setTextColor(255, 0, 0);
  doc.setFontSize(11);
  doc.text("Payment Terms:", x, y);
  doc.text(advance, x, y + 6);
  doc.text("Transport:", x, y + 12);
  doc.text(transport, x, y + 18);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.text("Bank Details:", x, y + 32);
  doc.text("Account Name: Shree Datta Trunk & Umbrella Mart ", x, y + 38);
  doc.text("Bank: Bank Of India ,Pune City Branch.", x, y + 44);
  doc.text("A/C No: 050630100000042", x, y + 50);
  doc.text("Type: C/C. A/c ", x, y + 56);
  doc.text("IFSC: BKID0000506", x, y + 62);
  doc.text("GPAY NO.: 9372949460", x, y + 68);

//   const qrImg = new Image();
//   qrImg.src = qrImagePath;
//   qrImg.onload = function () {
//     doc.addImage(qrImg, "PNG", 145, y + 25, 35, 35);

//     doc.setFontSize(10);
// doc.text("UPI: yourname@upi", 145, y + 62); // Adjust Y if needed


    const footerY = y + 80;
    doc.setFont("times", "normal");
    doc.text("GSTIN – 27ACPFS2215Q1ZH    ", x, footerY);
    doc.text("PAN – ACPFS2215Q", x, footerY + 6);

    doc.setFont("times", "bold");
    doc.text("For SHREE DATTA TRUNK & UMBRELLA MART", 110, footerY + 20);



    doc.save("proforma-invoice.pdf");
  };
}

addProduct();
