import {
  Check,
  AlertCircle,
  CornerDownRight,
  BookOpen,
  Heart,
  Target,
  Lightbulb,
  TrendingUp,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function CriteriaPage() {
  return (
    <div className="ds-section ds-section-criteria">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Criteria Components
      </h2>
      <p className="text-gray-700 mb-6">
        Components used for displaying evaluation criteria and feedback.
      </p>

      <div className="space-y-6">
        {/* Passed Criterion */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Passed Criterion</h3>
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-green-100 text-green-700">
                <Check className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Greets patient by name</div>
                <div className="text-sm text-gray-600 mt-1">
                  Evidence: "Good morning, Mr. Miller..."
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Failed Criterion */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Failed Criterion - What Happened
          </h3>
          <div
            className="border border-red-200 bg-red-50 rounded-lg p-4"
            style={{ borderWidth: '4px' }}
          >
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <strong className="text-gray-900 font-semibold">What Happened:</strong>
            </div>
            <p className="text-gray-800 ml-7 mb-3">
              Your first question was "How are you feeling today?" which, while friendly, is
              somewhat closed. This limits the patient's ability to share their full story.
            </p>
            <div className="ml-7 flex flex-wrap gap-2">
              <button className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1">
                <CornerDownRight className="w-4 h-4" />
                Jump to 00:20
              </button>
            </div>
          </div>
        </Card>

        {/* Educational Content */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Educational Content Sections</h3>
          <div className="space-y-6 px-8 py-6 bg-gray-50 rounded-lg">
            {/* Why It Matters */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-gray-600" />
                <strong className="text-gray-900 font-semibold text-sm">Why This Matters:</strong>
              </div>
              <p className="text-gray-700 text-sm">
                Open-ended questions allow patients to explain their concerns in their own words.
              </p>
            </div>

            {/* Patient Impact */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-gray-600" />
                <strong className="text-gray-900 font-semibold text-sm">Patient Impact:</strong>
              </div>
              <p className="text-gray-700 text-sm">
                Patients feel more heard when given space to share their story.
              </p>
            </div>

            {/* Better Alternatives */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-gray-600" />
                <strong className="text-gray-900 font-semibold text-sm">
                  Better Alternatives - Try Saying:
                </strong>
              </div>
              <div className="space-y-2">
                <div className="pl-3 border-l-2 border-green-400 text-gray-700 text-sm italic">
                  "What brings you in today?"
                </div>
                <div className="pl-3 border-l-2 border-green-400 text-gray-700 text-sm italic">
                  "Tell me what's been going on."
                </div>
              </div>
            </div>

            {/* How to Improve */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-gray-600" />
                <strong className="text-gray-900 font-semibold text-sm">How to Improve:</strong>
              </div>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Start with broad, open-ended questions</li>
                <li>• Use phrases that invite storytelling</li>
              </ul>
            </div>

            {/* Practice Exercise */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <strong className="text-gray-900 font-semibold text-sm">Practice This:</strong>
              </div>
              <p className="text-gray-700 text-sm">
                Write down 3 different open-ended questions before your next encounter.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
