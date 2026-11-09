import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/authStore';

const WelcomeScreen = () => {
  const { user } = useAuthStore();
  const displayName = user?.name || 'there';

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-10 px-6 sm:px-10 shadow-lg border-bb2 bg-white text-center">
          <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center text-green mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-navy mb-4 tracking-tight">Welcome, {displayName}!</h2>
          <p className="text-[14px] text-ink2 mb-8 leading-relaxed">
            Your business profile has been configured. You're now ready to start creating professional GST invoices and managing your catalog.
          </p>

          <Link to="/dashboard">
            <Button variant="primary" className="w-full py-3 text-[14px] shadow-md">
              Go to Dashboard <ArrowRight size={18} className="ml-1" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default WelcomeScreen;
