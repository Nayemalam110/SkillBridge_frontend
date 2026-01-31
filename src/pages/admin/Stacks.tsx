import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import type { TechStack } from '@/types';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

export function AdminStacks() {
  const { stacks, addStack, updateStack, deleteStack } = useSite();
  const [showModal, setShowModal] = useState(false);
  const [editingStack, setEditingStack] = useState<TechStack | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    description: '',
    color: '#6366F1',
  });

  const handleOpenModal = (stack?: TechStack) => {
    if (stack) {
      setEditingStack(stack);
      setFormData({
        name: stack.name,
        icon: stack.icon,
        description: stack.description,
        color: stack.color,
      });
    } else {
      setEditingStack(null);
      setFormData({ name: '', icon: '', description: '', color: '#6366F1' });
    }
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (editingStack) {
      updateStack(editingStack.id, formData);
    } else {
      addStack(formData);
    }
    setShowModal(false);
    setEditingStack(null);
    setFormData({ name: '', icon: '', description: '', color: '#6366F1' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this stack? This will also affect related jobs.')) {
      deleteStack(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tech Stacks</h1>
          <p className="text-gray-600">Manage technology stacks for job categories</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4" />
          Add Stack
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stacks.map((stack) => (
          <Card key={stack.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${stack.color}20` }}
                  >
                    {stack.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{stack.name}</h3>
                    <p className="text-sm text-gray-500">{stack.jobCount} jobs</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleOpenModal(stack)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(stack.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">{stack.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: stack.color }}
                />
                <span className="text-xs text-gray-400">{stack.color}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {stacks.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="py-16 text-center">
              <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No stacks yet</h3>
              <p className="text-gray-600 mt-2">Create your first tech stack to start posting jobs</p>
              <Button onClick={() => handleOpenModal()} className="mt-4">
                <Plus className="h-4 w-4" />
                Add Stack
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingStack ? 'Edit Stack' : 'Add New Stack'}
      >
        <div className="space-y-4">
          <Input
            label="Stack Name"
            placeholder="e.g., React, Python, UI/UX Design"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Icon (Emoji)"
            placeholder="e.g., ⚛️, 🐍, 🎨"
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            helperText="Use an emoji to represent this stack"
          />
          <Textarea
            label="Description"
            placeholder="Brief description of this technology stack..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#6366F1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name || !formData.icon}>
              {editingStack ? 'Update Stack' : 'Create Stack'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
