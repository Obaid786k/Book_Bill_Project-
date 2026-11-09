import React from 'react';
import { ComingSoonPanel } from '../../components/common/ComingSoonPanel';
import { Palette } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const AppearanceSettings = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />
      <div className="h-[60vh] bg-white rounded-lg border border-bb flex items-center justify-center p-6">
        <ComingSoonPanel
          icon={Palette}
          title="Appearance Settings"
          description="Soon you will be able to customize themes, color schemes, and upload your own branding elements to match your company's aesthetic."
        />
      </div>
    </div>
  );
};

export default AppearanceSettings;
