import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ApplicationPipeline } from '@/components/ApplicationPipeline';
import type { Application } from '@/types';
import { FileText, Calendar, ArrowRight, Eye } from 'lucide-react';

export function SeekerApplications() {
  const { user } = useAuth();
  const { applications } = useSite();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const myApplications = applications.filter((app) => app.userId === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track your job applications and their status</p>
      </div>

      {myApplications.length > 0 ? (
        <div className="space-y-4">
          {myApplications.map((app) => (
            <Card key={app.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{app.jobTitle}</h3>
                      <ApplicationPipeline status={app.status} compact />
                    </div>
                    <p className="text-gray-600">{app.stackName}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {app.cvFileName}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    {app.task && ['pending', 'in_progress'].includes(app.task.status) && (
                      <Link to="/dashboard/tasks">
                        <Button size="sm">
                          Complete Task <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Pipeline visualization */}
                <div className="mt-6 pt-6 border-t">
                  <ApplicationPipeline status={app.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-600 mt-2">Start applying to jobs to see them here</p>
            <Link to="/dashboard/jobs" className="inline-block mt-4">
              <Button>Browse Jobs</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Application Details Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Details"
        size="lg"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg">{selectedApp.jobTitle}</h3>
              <p className="text-gray-600">{selectedApp.stackName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Applied On</p>
                <p className="font-medium">{new Date(selectedApp.appliedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">{new Date(selectedApp.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Current Status</p>
              <ApplicationPipeline status={selectedApp.status} compact />
            </div>

            {selectedApp.coverLetter && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Cover Letter</p>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {selectedApp.coverLetter}
                </p>
              </div>
            )}

            {selectedApp.task && (
              <div className="border-t pt-6">
                <h4 className="font-medium mb-3">Task Assignment</h4>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <p className="font-medium text-indigo-900">{selectedApp.task.title}</p>
                  <p className="text-sm text-indigo-700 mt-1">
                    Deadline: {new Date(selectedApp.task.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-indigo-700">Status: {selectedApp.task.status}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
