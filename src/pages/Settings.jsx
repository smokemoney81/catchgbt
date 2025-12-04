
import React, { useState } from 'react';
import SettingsSection from '@/components/settings/SettingsSection';
import TutorialButton from '@/components/tutorial/TutorialButton';
import TutorialModal from '@/components/tutorial/TutorialModal';

export default function Settings() {
  const [tutorialOpen, setTutorialOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 p-6 pb-32">
      {/* Tutorial Button - Top Left */}
      <TutorialButton onClick={() => setTutorialOpen(true)} />

      <div className="max-w-4xl mx-auto">
        <SettingsSection />
      </div>

      {/* Tutorial Modal */}
      <TutorialModal isOpen={tutorialOpen} onClose={() => setTutorialOpen(false)} />
    </div>
  );
}
