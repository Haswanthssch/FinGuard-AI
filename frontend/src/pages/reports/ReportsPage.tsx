import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-2">Generate and manage compliance reports</p>
        </div>
        <Button>+ Generate Report</Button>
      </div>

      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { name: 'Portfolio Summary', type: 'Monthly' },
          { name: 'Risk Analysis', type: 'Quarterly' },
          { name: 'Compliance Report', type: 'Annual' },
          { name: 'Fraud Detection', type: 'Weekly' },
          { name: 'Performance Analysis', type: 'Monthly' },
          { name: 'Regulatory Filing', type: 'As Needed' },
        ].map((report) => (
          <Card key={report.name} className="cursor-pointer hover:border-blue-500 transition-colors">
            <CardContent className="pt-6">
              <p className="font-medium text-gray-900">{report.name}</p>
              <p className="text-sm text-gray-500 mt-2">{report.type}</p>
              <Button variant="secondary" size="sm" className="w-full mt-4">
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Portfolio Summary - May 2024', date: '2024-05-31', status: 'Completed' },
              { name: 'Risk Analysis - Q1 2024', date: '2024-04-15', status: 'Completed' },
              { name: 'Compliance Report - 2023', date: '2024-01-15', status: 'Completed' },
            ].map((report, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-500">{report.date}</p>
                </div>
                <span className="text-green-400 text-sm">{report.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
