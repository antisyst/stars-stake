import React, { useEffect } from 'react';
import { Page } from '@/components/Page';
import { useNavigate } from 'react-router-dom';
import { miniApp, useLaunchParams } from '@telegram-apps/sdk-react';
import { useAppData } from '@/contexts/AppDataContext';
import { resolveCssVarToHex } from '@/utils/css';
import { lockStableVh } from '@/utils/stableVh';
import { dismissIosKeyboard } from '@/utils/iosFocusBridge';
import { IntroLayout } from './layouts/IntroLayout/IntroLayout';
import { SetPasscodeLayout } from './layouts/SetPasscodeLayout/SetPasscodeLayout';
import { FaceIdSuggestionLayout } from './layouts/FaceIdSuggestionLayout/FaceIdSuggestionLayout';

type PasscodeStep = 'intro' | 'set' | 'faceIdSuggestion';

export const PasscodePage: React.FC = () => {
  const navigate = useNavigate();
  const lp = useLaunchParams();
  const { user } = useAppData();

  const isIos = lp.platform === 'ios';
  const hasPasscode = Boolean((user as any)?.passcodeHash);

  const isChangeFlow = hasPasscode;
  const [step, setStep] = React.useState<PasscodeStep>(isChangeFlow ? 'set' : 'intro');

  useEffect(() => {
    try {
      miniApp.setBackgroundColor('bg_color' as any);
      miniApp.setBottomBarColor('bg_color' as any);
    } catch {}
  }, []);

  useEffect(() => {
    const hex = resolveCssVarToHex('--app-bg');
    try { miniApp.setHeaderColor((hex || 'bg_color') as any); } catch {}
    return () => {
      try { miniApp.setHeaderColor('secondary_bg_color' as any); } catch {}
    };
  }, []);

  const handleEnablePasscode = () => {
    lockStableVh();
    setStep('set');
  };

  const handlePasscodeSuccess = () => {
    if (isChangeFlow) {
      navigate('/passcode-settings', { replace: true });
    } else if (isIos) {
      dismissIosKeyboard();
      setStep('faceIdSuggestion');
    } else {
      navigate('/passcode-settings', { replace: true });
    }
  };

  const handleFaceIdDone = () => {
    navigate('/passcode-settings', { replace: true });
  };

  const handleFaceIdSkip = () => {
    navigate('/passcode-settings', { replace: true });
  };

  return (
    <Page back>
      {step === 'intro' && (
        <IntroLayout onEnable={handleEnablePasscode} />
      )}
      {step === 'set' && (
        <SetPasscodeLayout onSuccess={handlePasscodeSuccess} />
      )}
      {step === 'faceIdSuggestion' && (
        <FaceIdSuggestionLayout onSkip={handleFaceIdSkip} onDone={handleFaceIdDone} />
      )}
    </Page>
  );
};

export default PasscodePage;