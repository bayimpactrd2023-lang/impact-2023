/**
 * About Tab Component
 * 
 * Tab for managing the About section content.
 */

import { CheckCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Textarea } from '@/app/components/ui/textarea';
import { Label } from '@/app/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { toast } from 'sonner';

interface AboutTabProps {
  aboutText: string;
  onUpdateAbout: (text: string) => void;
  onSave: () => void;
}

/**
 * About section management tab
 */
export function AboutTab({ aboutText, onUpdateAbout, onSave }: AboutTabProps) {
  const handleSave = () => {
    onSave();
    toast.success('About section saved!', {
      description: 'Your changes have been saved successfully.',
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>About Section</CardTitle>
          <CardDescription>
            Edit the about section content that appears on your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="about-text">About Text</Label>
            <Textarea
              id="about-text"
              value={aboutText}
              onChange={e => onUpdateAbout(e.target.value)}
              rows={10}
              className="mt-2"
              placeholder="Enter your organization's about text..."
            />
          </div>

          <Button
            className="w-full bg-gradient-to-r from-[#1887FC] to-[#3b82f6] hover:from-[#1570d8] hover:to-[#2563eb] text-white shadow-md"
            onClick={handleSave}
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Save About Section
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
