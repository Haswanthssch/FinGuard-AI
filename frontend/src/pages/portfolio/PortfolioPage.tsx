import { Card, CardHeader, CardTitle, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';

export function PortfolioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portfolio Intelligence</h1>
          <p className="text-gray-500 mt-2">Manage and analyze your investment portfolios</p>
        </div>
        <Button>+ New Portfolio</Button>
      </div>

      {/* Portfolio List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((idx) => (
          <Card key={idx} className="cursor-pointer hover:border-blue-500 transition-colors">
            <CardHeader>
              <CardTitle>Portfolio {idx}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-gray-500 text-sm">Total Value</p>
                <p className="text-xl font-bold text-gray-900">${(idx * 500000).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Holdings</p>
                <p className="text-lg font-semibold text-gray-900">{idx * 5} assets</p>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-green-400 text-sm">+{(idx * 2.5).toFixed(1)}% YTD</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Section */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Diversification Score</p>
                <p className="text-2xl font-bold text-gray-900">8.5/10</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Risk Level</p>
                <p className="text-2xl font-bold text-yellow-600">Medium</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
