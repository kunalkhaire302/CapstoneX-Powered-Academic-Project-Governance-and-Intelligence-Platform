'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function StudentTopicsPage() {
  return (
    <DashboardLayout role="student" title="Topic Submission" userName="Student 1">
      <Card>
        <h3 className="text-lg font-display text-thunder mb-6">Submit Your Project Topic</h3>
        <form className="space-y-5 max-w-2xl">
          <Input label="Project Title" placeholder="Enter your project title" id="topic-title" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-thunder">Abstract</label>
            <textarea className="w-full px-3 py-2 text-sm border border-border rounded-md h-32 focus:ring-2 focus:ring-cardinal focus:outline-none" placeholder="Describe your project in 200-300 words..." id="topic-abstract" />
          </div>
          <Input label="Domain Tags" placeholder="e.g., AI/ML, Web Development, IoT (comma separated)" id="topic-domains" />
          <Input label="Technology Tags" placeholder="e.g., Python, React, TensorFlow (comma separated)" id="topic-tech" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-thunder">Upload Proposal (PDF)</label>
            <input type="file" accept=".pdf,.docx" className="w-full text-sm text-slate" id="topic-file" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary">Save Draft</Button>
            <Button type="submit" id="submit-topic">Submit for Approval</Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
