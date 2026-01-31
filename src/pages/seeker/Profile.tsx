import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import type { JobSeekerProfile } from '@/types';
import { User, Globe, Github, Linkedin, Save } from 'lucide-react';

export function SeekerProfile() {
  const { user, updateProfile } = useAuth();
  const profile = user as JobSeekerProfile;

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    headline: profile?.headline || '',
    bio: profile?.bio || '',
    experience: profile?.experience || '',
    skills: profile?.skills?.join(', ') || '',
    portfolio: profile?.portfolio || '',
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updateProfile({
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
      cvFileName: cvFile?.name || profile?.cvFileName,
      cvUrl: cvFile ? URL.createObjectURL(cvFile) : profile?.cvUrl,
    });

    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600">Manage your profile information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Picture & CV */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900">{profile?.name}</h3>
              <p className="text-gray-600">{profile?.headline || 'Job Seeker'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Resume/CV</h3>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".pdf,.doc,.docx"
                value={cvFile}
                onChange={setCvFile}
                currentFileName={profile?.cvFileName}
                helperText="PDF, DOC, or DOCX"
              />
            </CardContent>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Basic Information</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                />
                <Input
                  label="Experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5 years"
                />
              </div>
              <Input
                label="Headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer"
              />
              <Textarea
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Skills</h3>
            </CardHeader>
            <CardContent>
              <Input
                label="Skills (comma separated)"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="React, TypeScript, Node.js, Python..."
                helperText="Enter your skills separated by commas"
              />
              {formData.skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.split(',').map((skill, i) => (
                    skill.trim() && (
                      <span
                        key={i}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {skill.trim()}
                      </span>
                    )
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Links</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Portfolio Website"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Linkedin className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="LinkedIn Profile"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Github className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="GitHub Profile"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            {saved && <span className="text-green-600 text-sm">Changes saved successfully!</span>}
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
