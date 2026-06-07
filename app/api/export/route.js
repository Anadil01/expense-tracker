import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only admin can export
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Admins only' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format'); // 'csv' or 'pdf'
  const month  = searchParams.get('month');  // '2025-06'

  await connectDB();

  // Build query
  const query = { workspaceId: session.user.workspaceId };
  if (month) {
    const start = new Date(`${month}-01`);
    const end   = new Date(start);
    end.setMonth(end.getMonth() + 1);
    query.date = { $gte: start, $lt: end };
  }

  const expenses = await Expense.find(query)
    .populate('submittedBy', 'name email')
    .populate('reviewedBy', 'name')
    .sort({ date: -1 })
    .lean();

  // ── CSV Export ───────────────────────────────────────
  if (format === 'csv') {
    const headers = [
      'Date', 'Title', 'Category', 'Amount (₹)',
      'Status', 'Submitted By', 'Review Note'
    ];

    const rows = expenses.map(exp => [
      new Date(exp.date).toLocaleDateString('en-IN'),
      // Wrap in quotes to handle commas in titles
      `"${exp.title}"`,
      exp.category,
      exp.amount,
      exp.status,
      exp.submittedBy?.name || '',
      `"${exp.reviewNote || ''}"`,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    return new Response(csv, {
      headers: {
        // This tells the browser to download the file, not display it
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="expenses-${month || 'all'}.csv"`,
      }
    });
  }

  // ── PDF Export ───────────────────────────────────────
  if (format === 'pdf') {
    const pdfDoc  = await PDFDocument.create();
    const font    = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontB   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const purple  = rgb(0.33, 0.29, 0.72);
    const black   = rgb(0.1,  0.1,  0.1);
    const gray    = rgb(0.5,  0.5,  0.5);
    const white   = rgb(1,    1,    1);
    const red     = rgb(0.87, 0.27, 0.27);
    const green   = rgb(0.11, 0.62, 0.46);

    let page      = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    let y         = height - 40;

    // Helper — add new page when content overflows
    const checkPageBreak = (needed = 20) => {
      if (y < needed + 60) {
        page = pdfDoc.addPage([595, 842]);
        y    = height - 40;
      }
    };

    // ── Header ──────────────────────────────────────────
    // Purple header bar
    page.drawRectangle({
      x: 0, y: height - 80,
      width, height: 80,
      color: purple,
    });

    page.drawText('Expense Report', {
      x: 40, y: height - 35,
      size: 22, font: fontB, color: white,
    });

    page.drawText(
      month
        ? `Period: ${new Date(`${month}-01`).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`
        : 'All Expenses',
      { x: 40, y: height - 58, size: 11, font, color: rgb(0.85, 0.85, 1) }
    );

    page.drawText(`Generated: ${new Date().toLocaleDateString('en-IN')}`, {
      x: 40, y: height - 72, size: 9, font, color: rgb(0.75, 0.75, 0.95)
    });

    y = height - 100;

    // ── Summary bar ─────────────────────────────────────
    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
    const approved    = expenses.filter(e => e.status === 'approved').length;
    const pending     = expenses.filter(e => e.status === 'pending').length;

    page.drawText(`Total: ₹${totalAmount.toLocaleString('en-IN')}`, {
      x: 40, y, size: 13, font: fontB, color: black
    });
    page.drawText(`${expenses.length} expenses  |  ${approved} approved  |  ${pending} pending`, {
      x: 40, y: y - 16, size: 9, font, color: gray
    });

    y -= 40;

    // ── Table header ─────────────────────────────────────
    const cols = { date: 40, title: 100, category: 220, amount: 320, status: 400, by: 460 };

    page.drawRectangle({
      x: 30, y: y - 4,
      width: width - 60, height: 20,
      color: rgb(0.95, 0.94, 1),
    });

    const drawHeader = () => {
      [
        [cols.date,     'Date'],
        [cols.title,    'Description'],
        [cols.category, 'Category'],
        [cols.amount,   'Amount'],
        [cols.status,   'Status'],
        [cols.by,       'By'],
      ].forEach(([x, label]) => {
        page.drawText(label, { x, y, size: 8, font: fontB, color: purple });
      });
    };

    drawHeader();
    y -= 22;

    // ── Table rows ───────────────────────────────────────
    expenses.forEach((exp, i) => {
      checkPageBreak(18);

      // Alternating row background
      if (i % 2 === 0) {
        page.drawRectangle({
          x: 30, y: y - 4,
          width: width - 60, height: 16,
          color: rgb(0.98, 0.98, 0.98),
        });
      }

      const statusColor = exp.status === 'approved' ? green
                        : exp.status === 'rejected'  ? red
                        : gray;

      // Truncate long titles
      const title = exp.title.length > 18
        ? exp.title.slice(0, 18) + '...'
        : exp.title;

      page.drawText(new Date(exp.date).toLocaleDateString('en-IN'), {
        x: cols.date, y, size: 8, font, color: black
      });
      page.drawText(title, {
        x: cols.title, y, size: 8, font, color: black
      });
      page.drawText(exp.category, {
        x: cols.category, y, size: 8, font, color: gray
      });
      page.drawText(`₹${exp.amount.toLocaleString('en-IN')}`, {
        x: cols.amount, y, size: 8, font: fontB, color: black
      });
      page.drawText(exp.status, {
        x: cols.status, y, size: 8, font: fontB, color: statusColor
      });
      page.drawText(exp.submittedBy?.name?.split(' ')[0] || '', {
        x: cols.by, y, size: 8, font, color: gray
      });

      y -= 18;
    });

    // ── Footer on every page ─────────────────────────────
    const pages = pdfDoc.getPages();
    pages.forEach((p, i) => {
      p.drawText(`Page ${i + 1} of ${pages.length}  |  Expense Tracker`, {
        x: 40,
        y: 20,
        size: 8,
        font,
        color: gray,
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="expenses-${month || 'all'}.pdf"`,
      }
    });
  }

  return NextResponse.json({ error: 'Format must be csv or pdf' }, { status: 400 });
}