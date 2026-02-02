'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function ColorsPage() {
  const [copiedText, setCopiedText] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  return (
    <div className="ds-section ds-section-colors">
      <h2 className="ds-section-title font-bold text-gray-900 mb-4" style={{ fontSize: '54px' }}>
        Brand Colors
      </h2>
      <p className="text-gray-700 mb-6">
        The brand color palette consists of three primary colors that reflect the institution's
        visual identity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-primary-gold rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-3">Primary Gold</h3>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-primary-gold')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-primary-gold{' '}
                {copiedText === 'bg-primary-gold' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#FFC627')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #FFC627{' '}
            {copiedText === '#FFC627' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(255, 198, 39)')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-2 hover:text-gray-900 cursor-pointer"
          >
            rgb(255, 198, 39){' '}
            {copiedText === 'rgb(255, 198, 39)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">Used for primary actions and emphasis</p>
        </Card>
        <Card>
          <div className="w-full h-32 bg-primary-maroon rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-3">Primary Maroon</h3>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-primary-maroon')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-primary-maroon{' '}
                {copiedText === 'bg-primary-maroon' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#8C1D40')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #8C1D40{' '}
            {copiedText === '#8C1D40' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(140, 29, 64)')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-2 hover:text-gray-900 cursor-pointer"
          >
            rgb(140, 29, 64){' '}
            {copiedText === 'rgb(140, 29, 64)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">Secondary brand color for accents</p>
        </Card>
        <Card>
          <div className="w-full h-32 bg-primary-black rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-3">Primary Black</h3>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-primary-black')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-primary-black{' '}
                {copiedText === 'bg-primary-black' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#191919')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #191919{' '}
            {copiedText === '#191919' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(25, 25, 25)')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-2 hover:text-gray-900 cursor-pointer"
          >
            rgb(25, 25, 25){' '}
            {copiedText === 'rgb(25, 25, 25)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">Text on gold backgrounds</p>
        </Card>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">System Colors</h3>
      <p className="text-gray-700 mb-6">
        System colors are used for notifications and alerts to help users understand the state of
        various components.
      </p>

      {/* Error Row */}
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Error</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-error rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Error</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-error')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-error{' '}
                {copiedText === 'bg-error' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#CC2F2F')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #CC2F2F{' '}
            {copiedText === '#CC2F2F' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(204, 47, 47)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(204, 47, 47){' '}
            {copiedText === 'rgb(204, 47, 47)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-error-text rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Error Text</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-error-text')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-error-text{' '}
                {copiedText === 'bg-error-text' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#B72A2A')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #B72A2A{' '}
            {copiedText === '#B72A2A' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(183, 42, 42)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(183, 42, 42){' '}
            {copiedText === 'rgb(183, 42, 42)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-error-light rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Error Light</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-error-light')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-error-light{' '}
                {copiedText === 'bg-error-light' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#FF7B7D')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #FF7B7D{' '}
            {copiedText === '#FF7B7D' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(255, 123, 125)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(255, 123, 125){' '}
            {copiedText === 'rgb(255, 123, 125)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
      </div>

      {/* Error Background Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-error-bg rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Error Background</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-error-bg')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-error-bg{' '}
                {copiedText === 'bg-error-bg' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#F7DDDD')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #F7DDDD{' '}
            {copiedText === '#F7DDDD' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(247, 221, 221)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(247, 221, 221){' '}
            {copiedText === 'rgb(247, 221, 221)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
      </div>

      {/* Info Row */}
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Info</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-info rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Info</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-info')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-info{' '}
                {copiedText === 'bg-info' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#126877')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #126877{' '}
            {copiedText === '#126877' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(18, 104, 119)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(18, 104, 119){' '}
            {copiedText === 'rgb(18, 104, 119)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-info-light rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Info Light</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-info-light')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-info-light{' '}
                {copiedText === 'bg-info-light' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#00B0F3')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #00B0F3{' '}
            {copiedText === '#00B0F3' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(0, 176, 243)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(0, 176, 243){' '}
            {copiedText === 'rgb(0, 176, 243)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-info-bg rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Info Background</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-info-bg')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-info-bg{' '}
                {copiedText === 'bg-info-bg' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#D6F0FA')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #D6F0FA{' '}
            {copiedText === '#D6F0FA' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(214, 240, 250)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(214, 240, 250){' '}
            {copiedText === 'rgb(214, 240, 250)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
      </div>

      {/* Warning Row */}
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Warning</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-warning rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Warning</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-warning')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-warning{' '}
                {copiedText === 'bg-warning' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#BD4800')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #BD4800{' '}
            {copiedText === '#BD4800' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(189, 72, 0)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(189, 72, 0){' '}
            {copiedText === 'rgb(189, 72, 0)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-warning-light rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Warning Light</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-warning-light')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-warning-light{' '}
                {copiedText === 'bg-warning-light' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#FF8034')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #FF8034{' '}
            {copiedText === '#FF8034' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(255, 128, 52)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(255, 128, 52){' '}
            {copiedText === 'rgb(255, 128, 52)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-warning-bg rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Warning Background</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-warning-bg')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-warning-bg{' '}
                {copiedText === 'bg-warning-bg' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#FFEADE')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #FFEADE{' '}
            {copiedText === '#FFEADE' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(255, 234, 222)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(255, 234, 222){' '}
            {copiedText === 'rgb(255, 234, 222)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
      </div>

      {/* Success Row */}
      <h4 className="text-lg font-semibold text-gray-900 mb-3">Success</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="w-full h-32 bg-success rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Success</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-success')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-success{' '}
                {copiedText === 'bg-success' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#446D12')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #446D12{' '}
            {copiedText === '#446D12' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(68, 109, 18)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(68, 109, 18){' '}
            {copiedText === 'rgb(68, 109, 18)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
        <Card>
          <div className="w-full h-32 bg-success-bg rounded-lg mb-4"></div>
          <h5 className="font-semibold text-gray-900 mb-3">Success Background</h5>
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Tailwind Class:</p>
            <button
              onClick={() => copyToClipboard('bg-success-bg')}
              className="w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <p className="text-sm font-mono font-semibold text-gray-900">
                bg-success-bg{' '}
                {copiedText === 'bg-success-bg' && (
                  <span className="text-green-600 text-xs">✓ Copied</span>
                )}
              </p>
            </button>
          </div>
          <button
            onClick={() => copyToClipboard('#E9F5DB')}
            className="block w-full text-left text-xs text-gray-600 font-mono mb-1 hover:text-gray-900 cursor-pointer"
          >
            #E9F5DB{' '}
            {copiedText === '#E9F5DB' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
          <button
            onClick={() => copyToClipboard('rgb(233, 245, 219)')}
            className="block w-full text-left text-xs text-gray-600 font-mono hover:text-gray-900 cursor-pointer"
          >
            rgb(233, 245, 219){' '}
            {copiedText === 'rgb(233, 245, 219)' && (
              <span className="text-green-600 text-xs ml-2">✓ Copied</span>
            )}
          </button>
        </Card>
      </div>
    </div>
  );
}
