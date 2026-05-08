import React from 'react';
import { useAuthState } from '../../contexts/auth';
import Card from '../shared/Card';

export const WelcomeCard = () => {
  const { user } = useAuthState();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {user?.username}!
          </h2>
          <p className="text-gray-600 mt-2">
            Continue seus estudos de coreano onde parou
          </p>
        </div>
        
        <div className="text-right">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {user?.role === 'admin' ? '👑 Admin' : '🎓 Estudante'}
          </div>
        </div>
      </div>
    </Card>
  );
};
