import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Badge } from '@/components/atoms/Badge';

export function FraudCenterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fraud Detection Center</h1>
        <p className="text-gray-500 mt-2">Monitor and manage fraud alerts</p>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: 2, color: 'danger' },
          { label: 'High', count: 5, color: 'warning' },
          { label: 'Medium', count: 12, color: 'info' },
          { label: 'Low', count: 28, color: 'default' },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-sm">{item.label} Risk</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{item.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 1, type: 'Unusual Transaction', risk: 'High', time: '2 hours ago' },
              { id: 2, type: 'Geographic Anomaly', risk: 'Medium', time: '4 hours ago' },
              { id: 3, type: 'Pattern Deviation', risk: 'Low', time: '6 hours ago' },
            ].map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{alert.type}</p>
                  <p className="text-sm text-gray-500">{alert.time}</p>
                </div>
                <Badge variant={alert.risk === 'High' ? 'error' : alert.risk === 'Medium' ? 'warning' : 'default'}>
                  {alert.risk}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
