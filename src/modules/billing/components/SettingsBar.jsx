import React from 'react';
import { COPY_TYPES } from '../copyTypes';
import { Segmented } from '../../../components/common/Segmented';

const LABEL = 'text-[12px] font-semibold text-ink2';
const Sep = () => <span className="hidden sm:block w-px h-6 bg-bb2" aria-hidden="true" />;

// Bill settings above the invoice — same controls as the rest of the app (no-print).
export const SettingsBar = ({ settings, onSettingsChange, disabled = false }) => (
  <div className="no-print max-w-[960px] mx-auto mt-3 bg-paper border border-bb2 rounded-[12px] px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
    <fieldset disabled={disabled} className="contents">
      <label className="inline-flex items-center gap-2 h-8 text-[13px] font-semibold text-ink cursor-pointer select-none">
        <input
          type="checkbox"
          checked={settings.gstOn}
          onChange={(e) => onSettingsChange('gstOn', e.target.checked)}
          className="accent-navy w-4 h-4"
        />
        GST registered
      </label>

      {settings.gstOn && (
        <>
          <Sep />
          <div className="flex items-center gap-2">
            <span className={LABEL}>Tax</span>
            <Segmented
              label="Tax type"
              value={settings.tt}
              onChange={(v) => onSettingsChange('tt', v)}
              options={[
                { value: 'intra', label: 'Same state (CGST+SGST)' },
                { value: 'inter', label: 'Other state (IGST)' },
              ]}
            />
          </div>
          <Sep />
          <div className="flex items-center gap-2">
            <span className={LABEL}>Prices</span>
            <Segmented
              label="Prices"
              value={settings.priceMode === 'inclusive' ? 'inclusive' : 'exclusive'}
              onChange={(v) => onSettingsChange('priceMode', v)}
              options={[
                { value: 'exclusive', label: 'Excl. GST' },
                { value: 'inclusive', label: 'Incl. GST' },
              ]}
            />
          </div>
        </>
      )}

      <Sep />
      <label className="flex items-center gap-2">
        <span className={LABEL}>Copy</span>
        <select
          value={settings.copyType}
          onChange={(e) => onSettingsChange('copyType', e.target.value)}
          className="h-8 pl-2.5 pr-7 border border-bb rounded-lg text-[12.5px] font-semibold text-ink bg-paper outline-none focus:border-navy cursor-pointer"
        >
          {COPY_TYPES.map((label) => <option key={label}>{label}</option>)}
        </select>
      </label>
    </fieldset>
  </div>
);
