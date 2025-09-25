import React from "react";
import { Dialog, DialogContent, Button } from "@quillsocial/ui";
import { AlertTriangle } from "lucide-react";

interface TwitterCharacterLimitDialogProps {
  open: boolean;
  onClose: () => void;
  onProceed: () => void;
  characterCount: number;
  content: string;
}

export const TwitterCharacterLimitDialog: React.FC<TwitterCharacterLimitDialogProps> = ({
  open,
  onClose,
  onProceed,
  characterCount,
  content,
}) => {
  const isOverLimit = characterCount > 280;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <div className="py-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-bold">X/Twitter Character Limit</h3>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Character count:</span>
              <span className={`font-semibold ${isOverLimit ? 'text-red-600' : characterCount > 250 ? 'text-amber-600' : 'text-green-600'}`}>
                {characterCount}/280
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverLimit
                    ? 'bg-red-500'
                    : characterCount > 250
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min((characterCount / 280) * 100, 100)}%`
                }}
              />
            </div>
          </div>

          {/* Content preview */}
          <div className="mb-4">
            <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {content}
              </p>
            </div>
          </div>

          {isOverLimit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> Your post exceeds the 280 character limit for X/Twitter free plan.
                Content may be truncated when published.
              </p>
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>X/Twitter Free Plan:</strong> Maximum 280 characters per post.
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 bg-white border border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onProceed();
                onClose();
              }}
              className={isOverLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {isOverLimit ? 'Publish Anyway' : 'Continue to Publish'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
