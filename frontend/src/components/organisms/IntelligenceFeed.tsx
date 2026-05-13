import React, { useEffect } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, Eye, CheckCircle, AlertTriangle, Zap, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export function IntelligenceFeed() {
  const feed = useAgentStore((state) => state.feed);
  const removeFeedItem = useAgentStore((state) => state.removeFeedItem);

  const getIcon = (type: string) => {
    switch (type) {
      case 'insight':
        return <Zap className="w-4 h-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4" />;
      case 'observation':
        return <Eye className="w-4 h-4" />;
      case 'recommendation':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100';
      case 'high':
        return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-100';
      case 'medium':
        return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-100';
    }
  };

  const getIconColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="w-72 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            📡
          </motion.div>
          Live Intelligence Feed
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Real-time insights from {feed.length} active observations
        </p>
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto">
        {feed.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Intelligence feed will populate as agents analyze your portfolio
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {feed.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'p-3 rounded-lg border transition-all hover:shadow-md',
                  getSeverityColor(item.severity)
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-0.5 flex-shrink-0', getIconColor(item.severity))}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs mb-1 uppercase tracking-wider opacity-75">
                      {item.type}
                    </p>
                    <p className="text-sm font-semibold line-clamp-2">
                      {item.title}
                    </p>
                    <p className="text-xs mt-1 line-clamp-2 opacity-75">
                      {item.content}
                    </p>
                    <p className="text-xs mt-2 opacity-60">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                    {item.actionable && (
                      <div className="mt-2 inline-block px-2 py-1 bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-10 rounded text-xs font-medium">
                        Actionable
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFeedItem(item.id)}
                    className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 opacity-50" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900/20 text-xs text-gray-600 dark:text-gray-400">
        <p className="flex items-center gap-2">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
            🔴
          </motion.div>
          Live monitoring active
        </p>
      </div>
    </div>
  );
}
