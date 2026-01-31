import { useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Save, Globe, Image, Type, Mail, Share2 } from 'lucide-react';

export function AdminSettings() {
  const { settings, updateSettings } = useSite();
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialKey = name.split('.')[1] as keyof typeof formData.socialLinks;
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [socialKey]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    updateSettings(formData);
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-600">
          Configure your job portal's appearance and content
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Branding */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Branding</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Site Name"
              name="siteName"
              value={formData.siteName}
              onChange={handleChange}
              placeholder="TechHire"
            />
            <Input
              label="Logo URL"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://example.com/logo.png"
              helperText="Leave empty to use text logo"
            />
          </CardContent>
        </Card>

        {/* Hero Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Hero Section</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Hero Title"
              name="heroTitle"
              value={formData.heroTitle}
              onChange={handleChange}
              placeholder="Find Your Dream Tech Job"
            />
            <Textarea
              label="Hero Subtitle"
              name="heroSubtitle"
              value={formData.heroSubtitle}
              onChange={handleChange}
              rows={3}
              placeholder="Connect with top tech companies..."
            />
            <Input
              label="Hero Background Image URL"
              name="heroImage"
              value={formData.heroImage}
              onChange={handleChange}
              placeholder="https://example.com/hero.jpg"
            />
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Image className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">About Section</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="About Title"
              name="aboutTitle"
              value={formData.aboutTitle}
              onChange={handleChange}
              placeholder="About TechHire"
            />
            <Textarea
              label="About Content"
              name="aboutContent"
              value={formData.aboutContent}
              onChange={handleChange}
              rows={5}
              placeholder="Tell visitors about your platform..."
            />
          </CardContent>
        </Card>

        {/* Contact & Footer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Contact & Footer</h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Contact Email"
              name="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={handleChange}
              placeholder="hello@techhire.com"
            />
            <Input
              label="Footer Text"
              name="footerText"
              value={formData.footerText}
              onChange={handleChange}
              placeholder="© 2024 TechHire. All rights reserved."
            />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-gray-400" />
              <h2 className="font-semibold">Social Links</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="Twitter URL"
                name="social.twitter"
                value={formData.socialLinks.twitter || ''}
                onChange={handleChange}
                placeholder="https://twitter.com/techhire"
              />
              <Input
                label="LinkedIn URL"
                name="social.linkedin"
                value={formData.socialLinks.linkedin || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/company/techhire"
              />
              <Input
                label="GitHub URL"
                name="social.github"
                value={formData.socialLinks.github || ''}
                onChange={handleChange}
                placeholder="https://github.com/techhire"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-green-600 text-sm">Settings saved successfully!</span>
        )}
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      {/* Preview */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold">Preview</h2>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold">{formData.heroTitle}</h1>
            <p className="mt-4 text-indigo-100">{formData.heroSubtitle}</p>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold">{formData.aboutTitle}</h3>
            <p className="text-gray-600 mt-2">{formData.aboutContent}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
