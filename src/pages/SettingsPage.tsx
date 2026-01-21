import React from 'react';
import SettingsView from '../components/SettingsView';
import { useUIStore } from '../store/useUIStore';

const SettingsPage: React.FC = () => {
    const { userPreferences, updatePreferences } = useUIStore();

    return (
        <SettingsView
            preferences={userPreferences}
            onUpdatePreferences={updatePreferences}
        />
    );
};

export default SettingsPage;
