import {
  Check,
  X,
  AlertCircle,
  Clock,
  BookOpen,
  Heart,
  Target,
  Lightbulb,
  TrendingUp,
  Send,
  Mic,
  CornerDownRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function IconsPage() {
  return (
    <div className="ds-section ds-section-icons">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Icons
      </h2>
      <p className="text-gray-700 mb-6">Lucide icons used throughout the application.</p>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Icons</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="flex flex-col items-center gap-2">
            <Check className="w-6 h-6 text-green-600" />
            <span className="text-xs text-gray-600">Check</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <X className="w-6 h-6 text-red-600" />
            <span className="text-xs text-gray-600">X</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <span className="text-xs text-gray-600">AlertCircle</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Clock className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Clock</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">BookOpen</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Heart className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Heart</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Target className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Target</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Lightbulb className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Lightbulb</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">TrendingUp</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Send className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Send</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Mic className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">Mic</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CornerDownRight className="w-6 h-6 text-gray-600" />
            <span className="text-xs text-gray-600">CornerDownRight</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
