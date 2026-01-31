import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { users } from '@/data/dummyData';
import { Plus, Trash2, Mail, Shield, Clock, UserCheck } from 'lucide-react';

export function AdminAdmins() {
  const { stacks, invites, addInvite, deleteInvite } = useSite();
  const { user: currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedStacks, setSelectedStacks] = useState<string[]>([]);

  const stackAdmins = users.filter((u) => u.role === 'stack_admin');

  const handleInvite = () => {
    if (!email || selectedStacks.length === 0) return;

    addInvite({
      email,
      assignedStacks: selectedStacks,
      invitedBy: currentUser?.id || '',
    });

    setShowModal(false);
    setEmail('');
    setSelectedStacks([]);
  };

  const toggleStack = (stackId: string) => {
    setSelectedStacks((prev) =>
      prev.includes(stackId) ? prev.filter((id) => id !== stackId) : [...prev, stackId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stack Admins</h1>
          <p className="text-gray-600">Manage admin access and invite new stack administrators</p>
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
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{admin.name}</p>
                    <p className="text-sm text-gray-500">{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {admin.assignedStacks?.map((stackId) => {
                      const stack = stacks.find((s) => s.id === stackId);
                      return stack ? (
                        <Badge key={stackId} variant="info">
                          {stack.icon} {stack.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
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
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
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
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {invite.assignedStacks.map((stackId) => {
                        const stack = stacks.find((s) => s.id === stackId);
                        return stack ? (
                          <Badge key={stackId} variant="warning">
                            {stack.icon} {stack.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteInvite(invite.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
        }}
        title="Invite Stack Admin"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{stack.icon}</span>
                  <span className="font-medium">{stack.name}</span>
                  {selectedStacks.includes(stack.id) && (
                    <UserCheck className="h-4 w-4 text-indigo-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Select which tech stacks this admin will manage
            </p>
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
