import React from 'react';

export const SettingsBar = ({ settings, onSettingsChange }) => {
  return (
    <div className="settings no-print">
      <label>
        <input 
          type="checkbox" 
          checked={settings.gstOn} 
          onChange={(e) => onSettingsChange('gstOn', e.target.checked)} 
        /> 
        GST Registered
      </label>
      <div className="sep"></div>
      
      <div id="taxGroup" style={{ display: settings.gstOn ? 'flex' : 'none', gap: '11px', alignItems: 'center' }}>
        <span style={{ color: 'var(--ink2)', fontSize: '12px' }}>Tax:</span>
        <label>
          <input 
            type="radio" 
            name="tt" 
            value="intra" 
            checked={settings.tt === 'intra'} 
            onChange={(e) => onSettingsChange('tt', e.target.value)} 
          /> 
          Same State (CGST+SGST)
        </label>
        <label>
          <input 
            type="radio" 
            name="tt" 
            value="inter" 
            checked={settings.tt === 'inter'} 
            onChange={(e) => onSettingsChange('tt', e.target.value)} 
          /> 
          Other State (IGST)
        </label>
      </div>
      
      <div className="sep" style={{ display: settings.gstOn ? 'block' : 'none' }}></div>
      
      <label style={{ gap: '7px', fontSize: '12px' }}>Copy:
        <select 
          className="s-select" 
          value={settings.copyType}
          onChange={(e) => onSettingsChange('copyType', e.target.value)}
        >
          <option>Original for Recipient</option>
          <option>Duplicate for Supplier</option>
          <option>Triplicate for Transporter</option>
        </select>
      </label>
    </div>
  );
};
