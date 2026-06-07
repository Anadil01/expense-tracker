import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Expense from '@/lib/models/Expense';
import Workspace from '@/lib/models/Workspace';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();

  const workspaceId = session.user.workspaceId;
  const now = new Date();

  // Current month range
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Last 6 months range — for bar chart
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const workspace = await Workspace.findById(workspaceId);

  // Run all aggregations in parallel — don't await one by one
  const [
    monthlyTotals,    // bar chart — spend per month
    categoryTotals,   // pie chart — spend per category
    statusCounts,     // summary cards — pending/approved/rejected
    recentExpenses,   // recent activity feed
    topSpenders,      // leaderboard — who spent most
  ] = await Promise.all([

    // 1. Monthly totals for last 6 months
    Expense.aggregate([
      {
        $match: {
          workspaceId: workspace._id,
          status: 'approved',
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        // Group by year + month
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    // 2. Category breakdown this month
    Expense.aggregate([
      {
        $match: {
          workspaceId: workspace._id,
          status: 'approved',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]),

    // 3. Count by status this month
    Expense.aggregate([
      {
        $match: {
          workspaceId: workspace._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]),

    // 4. Recent 5 expenses
    Expense.find({ workspaceId: workspace._id })
      .populate('submittedBy', 'name image')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    // 5. Top spenders this month
    Expense.aggregate([
      {
        $match: {
          workspaceId: workspace._id,
          status: 'approved',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$submittedBy',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 5 },
      // Join with User collection to get names
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' }
    ]),
  ]);

  // Shape monthly data for Recharts
  // Fill in missing months with 0 so chart always shows 6 bars
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun',
                       'Jul','Aug','Sep','Oct','Nov','Dec'];

  const monthlyChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const match = monthlyTotals.find(
      m => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1
    );
    monthlyChart.push({
      month: MONTH_NAMES[d.getMonth()],
      total: match?.total || 0
    });
  }

  // Shape status counts into a flat object
  const statusMap = { pending: 0, approved: 0, rejected: 0 };
  let totalApprovedAmount = 0;
  statusCounts.forEach(s => {
    statusMap[s._id] = s.count;
    if (s._id === 'approved') totalApprovedAmount = s.total;
  });

  const budget = workspace.monthlyBudget;
  const budgetPercentage = budget > 0
    ? Math.round((totalApprovedAmount / budget) * 100)
    : 0;

  return NextResponse.json({
    workspace: { name: workspace.name, budget },
    summary: {
      ...statusMap,
      totalApprovedAmount,
      budgetPercentage,
      isWarning:  budgetPercentage >= 80 && budgetPercentage < 100,
      isExceeded: budgetPercentage >= 100,
    },
    monthlyChart,
    categoryChart: categoryTotals.map(c => ({
      name: c._id,
      value: c.total
    })),
    recentExpenses,
    topSpenders: topSpenders.map(s => ({
      name: s.user.name,
      image: s.user.image,
      total: s.total,
      count: s.count,
    })),
  });
}