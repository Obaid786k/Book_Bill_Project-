import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/forms/TextInput';
import { Textarea } from '../../components/forms/Textarea';
import { Select } from '../../components/forms/Select';
import { Button } from '../../components/common/Button';
import { shopService } from '../../services/shopService';
import { useAuthStore } from '../../store/authStore';

// Schemas for each step
const step1Schema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  gstin: z.string().optional(),
  contactPhone: z.string().min(10, 'Valid phone required'),
});

const step2Schema = z.object({
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Valid pincode required'),
});

const step3Schema = z.object({
  defaultTaxType: z.string(),
  defaultTerms: z.string().optional(),
});

const step4Schema = z.object({
  paymentMode: z.string(),
  upiId: z.string().optional(),
});

const STEPS = ['Business Info', 'Address', 'Preferences', 'Payment'];

const STEP_INTRO = [
  { title: 'Tell us about your business', description: 'This appears on every invoice you create.' },
  { title: 'Where are you located?', description: 'Used for your invoice address and GST place-of-supply calculations.' },
  { title: 'Set your defaults', description: 'You can change these anytime later in Settings.' },
  { title: 'How do customers pay you?', description: 'Shown on invoices so customers know how to pay.' },
];

const BusinessSetup = () => {
  const navigate = useNavigate();
  const { completeSetup } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Select schema based on current step
  const schemas = [step1Schema, step2Schema, step3Schema, step4Schema];
  const currentSchema = schemas[currentStep];

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: formData
  });

  const handleNext = async (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final Submit
      setIsSaving(true);
      try {
        await shopService.saveProfile({
          shopName: updatedData.businessName || '',
          shopGstin: updatedData.gstin || '',
          shopPhone: updatedData.contactPhone || '',
          shopAddress: `${updatedData.addressLine1 || ''}, ${updatedData.city || ''} - ${updatedData.pincode || ''}`,
          shopState: updatedData.state || '',
          defaultTaxType: updatedData.defaultTaxType || 'inclusive',
          defaultTerms: updatedData.defaultTerms || '',
          payMode: updatedData.paymentMode || 'Cash',
          upiId: updatedData.upiId || '',
          hasCompletedSetup: true
        });
        completeSetup();
        navigate('/welcome');
      } catch (err) {
        console.error("Setup failed", err);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSkip = async () => {
    setIsSaving(true);
    try {
      // Save whatever is currently in the form state before skipping
      const currentVals = { ...formData };
      await shopService.saveProfile({
        shopName: currentVals.businessName || '',
        shopGstin: currentVals.gstin || '',
        shopPhone: currentVals.contactPhone || '',
        shopAddress: currentVals.addressLine1 ? `${currentVals.addressLine1}, ${currentVals.city || ''} - ${currentVals.pincode || ''}` : '',
        shopState: currentVals.state || '',
        hasCompletedSetup: true
      });
      completeSetup();
      navigate('/dashboard'); // Skip straight to dashboard
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col py-12 px-4 sm:px-6 lg:px-8 font-body">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="text-2xl font-bold text-navy text-center mb-8">Set up your business</h2>
        
        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-bb2 z-0"></div>
          {STEPS.map((step, idx) => (
            <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border-2 transition-colors bg-white",
                idx < currentStep ? "border-green text-green" :
                idx === currentStep ? "border-navy text-navy" : "border-bb2 text-ink3"
              )}>
                {idx < currentStep ? '✓' : idx + 1}
              </div>
              <span className={clsx(
                "text-[10px] uppercase font-bold tracking-wider absolute top-10 whitespace-nowrap",
                idx <= currentStep ? "text-navy" : "text-ink3"
              )}>{step}</span>
            </div>
          ))}
        </div>

        <Card className="p-6 sm:p-8 mt-12 bg-white">
          <div className="mb-6">
            <h3 className="text-[16px] font-bold text-navy">{STEP_INTRO[currentStep].title}</h3>
            <p className="text-[12.5px] text-ink2 mt-0.5">{STEP_INTRO[currentStep].description}</p>
          </div>
          <form onSubmit={handleSubmit(handleNext)} className="flex flex-col gap-5">
            {/* STEP 1 */}
            {currentStep === 0 && (
              <>
                <TextInput label="Business Name" placeholder="Acme Corp" {...register('businessName')} error={errors.businessName?.message} />
                <TextInput label="GSTIN (Optional)" placeholder="22AAAAA0000A1Z5" {...register('gstin')} error={errors.gstin?.message} />
                <TextInput label="Contact Phone" type="tel" placeholder="9876543210" {...register('contactPhone')} error={errors.contactPhone?.message} />
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 1 && (
              <>
                <TextInput label="Address Line 1" placeholder="123 Main St" {...register('addressLine1')} error={errors.addressLine1?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <TextInput label="City" placeholder="Mumbai" {...register('city')} error={errors.city?.message} />
                  <TextInput label="State" placeholder="Maharashtra" {...register('state')} error={errors.state?.message} />
                </div>
                <TextInput label="Pincode" placeholder="400001" {...register('pincode')} error={errors.pincode?.message} />
              </>
            )}

            {/* STEP 3 */}
            {currentStep === 2 && (
              <>
                <Select 
                  label="Default Tax Type" 
                  options={[
                    { value: 'inclusive', label: 'Tax Inclusive' },
                    { value: 'exclusive', label: 'Tax Exclusive' },
                    { value: 'none', label: 'No Tax' }
                  ]}
                  {...register('defaultTaxType')} 
                  error={errors.defaultTaxType?.message} 
                />
                <Textarea label="Default Terms & Conditions" placeholder="Goods once sold will not be taken back." rows={3} {...register('defaultTerms')} error={errors.defaultTerms?.message} />
              </>
            )}

            {/* STEP 4 */}
            {currentStep === 3 && (
              <>
                <Select 
                  label="Default Payment Mode" 
                  options={[
                    { value: 'cash', label: 'Cash' },
                    { value: 'upi', label: 'UPI' },
                    { value: 'bank', label: 'Bank Transfer' }
                  ]}
                  {...register('paymentMode')} 
                  error={errors.paymentMode?.message} 
                />
                <TextInput label="UPI ID (Optional)" placeholder="merchant@upi" {...register('upiId')} error={errors.upiId?.message} />
              </>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-6 border-t border-bb2 gap-4">
              <div className="order-2 sm:order-1">
                <button 
                  type="button" 
                  onClick={handleSkip}
                  disabled={isSaving}
                  className="text-[13px] font-semibold text-ink3 hover:text-navy transition-colors underline-offset-4 hover:underline"
                >
                  Skip for now
                </button>
              </div>
              <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={currentStep === 0 || isSaving}
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  isLoading={isSaving}
                  className="flex-1 sm:flex-none"
                >
                  {currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSetup;
