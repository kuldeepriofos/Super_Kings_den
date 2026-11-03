'use client';

import React from 'react';
import PlayerEditorForm from '../../../../components/admin/PlayerEditorForm';

export default function NewPlayerPage() {
  return <PlayerEditorForm initialPlayer={null} isCreating={true} />;
}
