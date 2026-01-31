import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { users, defaultStackAdminPermissions } from '@/data/dummyData';
import type { StackAdminPermissions } from '@/types';
import { Plus, Trash2, Mail, Shield, Clock, UserCheck, Settings, Check, X } from 'lucide-react';

export function AdminAdmins() {
  const { stacks, invites, addInvite, deleteInvite } = useSite();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<StackAdminPermissions>(defaultStackAdminPermissions);

  const stackAdmins = users.filter((u) => u.role === 'stack_admin');

  const handleInvite = () => {
    if (!email || selectedStacks.length === 0) return;

    addInvite({
      email,
      assignedStacks: selectedStacks,
      permissions,
      invitedBy: currentUser?.id || '',
    });

    setShowModal(false);
    setEmail('');
    setSelectedStacks([]);
    setPermissions(defaultStackAdminPermissions);
  };

  const toggleStack = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId) ? prev.filter((id) => id !== stackId) : [...prev, stackId]
    );
  };

  const togglePermission = (key: keyof StackAdminPermissions) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const permissionLabels: Record<keyof StackAdminPermissions, { label: string; description: string }> = {
    canPostJobs: { label: 'Post Jobs', description: 'Can create new job postings' },
    canEditJobs: { label: 'Edit Jobs', description: 'Can modify existing job postings' },
    canDeleteJobs: { label: 'Delete Jobs', description: 'Can remove job postings' },
    canChangeApplicationStatus: { label: 'Change Status', description: 'Can update application statuses' },
    canSendTasks: { label: 'Send Tasks', description: 'Can assign tasks to applicants' },
    canReviewTasks: { label: 'Review Tasks', description: 'Can review submitted tasks' },
    canViewApplicantDetails: { label: 'View Details', description: 'Can see full applicant information' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stack Admins</h1>
          <p className="text-gray-600">Manage admin access and permissions</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Invite Admin
        </Button>
      </div>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Current Stack Admins</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stackAdmins.map((admin) => (
              <div
                key={admin.id}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{admin.name}</p>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                
                {/* Assigned Stacks */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-sm text-slate-500">Stacks:</span>
                  {admin.assignedStacks?.map((stackId) => {
                    const stack = stacks.find((s) => s.id === stackId);
                    return stack ? (
                      <Badge key={stackId} variant="info">
                        {stack.icon} {stack.name}
                      </Badge>
                    ) : null;
                  })}
                </div>

                {/* Permissions */}
                {admin.permissions && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-500">Permissions:</span>
                    {Object.entries(admin.permissions).map(([key, value]) => (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          value ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {permissionLabels[key as keyof StackAdminPermissions]?.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {stackAdmins.length === 0 && (
              <p className="text-center text-gray-500 py-8">No stack admins yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pending Invitations</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invites
              .filter((i) => i.status === 'pending')
              .map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 bg-yellow-50 rounded-xl border border-yellow-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                        <Mail className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invite.email}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          Expires {new Date(invite.expiresAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-sm text-slate-500">Stacks:</span>
                    {invite.assignedStacks.map((stackId) => {
                      const stack = stacks.find((s) => s.id === stackId);
                      return stack ? (
                        <Badge key={stackId} variant="warning">
                          {stack.icon} {stack.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-slate-500">Permissions:</span>
                    {Object.entries(invite.permissions).map(([key, value]) => (
                      <span
                        key={key}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                          value ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {value ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {permissionLabels[key as keyof StackAdminPermissions]?.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

            {invites.filter((i) => i.status === 'pending').length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending invitations</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEmail('');
          setSelectedStacks([]);
          setPermissions(defaultStackAdminPermissions);
        }}
        title="Invite Stack Admin"
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText="The invitation link will be sent to this email"
          />

          {/* Stack Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Assign to Stacks
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stacks.map((stack) => (
                <button
                  key={stack.id}
                  type="button"
                  onClick={() => toggleStack(stack.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                    selectedStacks.includes(stack.id)
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{stack.icon}</span>
                  <span className="font-medium">{stack.name}</span>
                  {selectedStacks.includes(stack.id) && (
                    <UserCheck className="h-4 w-4 text-sky-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissions
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Control what this admin can do within their assigned stacks
            </p>
            <div className="space-y-2">
              {(Object.entries(permissionLabels) as [keyof StackAdminPermissions, { label: string; description: string }][]).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    permissions[key]
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={permissions[key]}
                      onChange={() => togglePermission(key)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <p className="font-medium text-slate-900">{value.label}</p>
                      <p className="text-xs text-slate-500">{value.description}</p>
                    </div>
                  </div>
                  {permissions[key] ? (
                    <Check className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <X className="h-5 w-5 text-slate-300" />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!email || selectedStacks.length === 0}>
              <Mail className="h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
