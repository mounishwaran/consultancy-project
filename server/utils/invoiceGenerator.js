import PDFDocument from 'pdfkit'

function generateInvoice(order, user, res) {
  try {
    console.log('=== INVOICE GENERATOR START ===');
    console.log('Order ID:', order._id);
    console.log('User name:', user?.name);
    console.log('Headers sent:', res.headersSent);
    
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order._id}.pdf` 
    );

    console.log('Headers set successfully');

    const doc = new PDFDocument();
    doc.pipe(res);

    console.log('PDF created and piped');

    doc.font("Helvetica");

    doc.fontSize(20).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text("Jolly Enterprises");
    doc.fontSize(12).text("Invoice Number: INV-" + order._id.toString().slice(-8).toUpperCase());
    doc.text("Order Date: " + new Date(order.createdAt).toLocaleDateString());
    doc.text("Customer: " + (user?.name || "N/A"));
    doc.moveDown();

    doc.fontSize(14).text("Order Items", { underline: true });
    doc.fontSize(12);

    console.log('Order items count:', order.orderItems?.length);

    order.orderItems.forEach((item) => {
      const y = doc.y;
      doc.text(item.name, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text("Rs. " + item.price, 350, y);
      doc.text("Rs. " + (item.price * item.quantity), 450, y);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fontSize(14).text("Total: Rs. " + order.totalPrice);
    doc.moveDown();

    doc.fontSize(10).text("Thank you for your business!", { align: "center" });

    doc.end();
    console.log('PDF ended successfully');
    
  } catch (error) {
    console.error('=== INVOICE GENERATOR ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
}

export default generateInvoice;
