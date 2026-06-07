import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import Workspace from '@/lib/models/Workspace';
import { NextResponse } from 'next/server';

// GET /api/budget — returns current month spend vs budget
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const workspace = await Workspace.findById(session.user.workspaceId);

  // Get current month's date range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // MongoDB aggregation — sum all approved expenses this month
  // This is more efficient than fetching all and summing in JS
  const result = await Expense.aggregate([
    {
      $match: {
        workspaceId: workspace._id,
        status: 'approved',
        date: { $gte: startOfMonth, $lte: endOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        totalSpent: { $sum: '$amount' }  // sum all amounts
      }
    }
  ]);

  const totalSpent = result[0]?.totalSpent || 0;
  const budget = workspace.monthlyBudget;
  const percentage = budget > 0 ? (totalSpent / budget) * 100 : 0;

  return NextResponse.json({
    totalSpent,
    budget,
    percentage: Math.round(percentage),
    // These flags drive the UI alerts
    isWarning: percentage >= 80 && percentage < 100,
    isExceeded: percentage >= 100,
  });
}