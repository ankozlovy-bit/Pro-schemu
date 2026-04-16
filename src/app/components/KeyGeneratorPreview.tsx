import { StylePreset } from '../types/style-preset';
import { memo } from 'react';

interface KeyGeneratorPreviewProps {
  selectedLanguage: string;
  selectedStyle: StylePreset;
  designerName: string;
  translations: Record<string, string>;
  maxRows?: number; // Limit rows for performance
}

export const KeyGeneratorPreview = memo(function KeyGeneratorPreview({
  selectedLanguage,
  selectedStyle,
  designerName,
  translations,
  maxRows = 5 // Show only 5 rows by default for performance
}: KeyGeneratorPreviewProps) {
  // Calculate font size in pixels from RTF half-points
  const fontSizePx = parseInt(selectedStyle.fontSize) / 2;
  
  // Border style - hide if borderColor is empty
  const borderStyle = selectedStyle.borderColor && selectedStyle.borderColor !== '' 
    ? `1px solid ${selectedStyle.borderColor}` 
    : '1px solid transparent';
  
  // Header text style with accent color
  const headerTextStyle = {
    color: selectedStyle.accentColor,
    fontWeight: 'bold' as const
  };
  
  // Cell text style to prevent subscript rendering
  const cellTextStyle = {
    fontVariantNumeric: 'normal' as const,
    fontFeatureSettings: 'normal' as const,
    verticalAlign: 'baseline' as const
  };
  
  return (
    <div className="space-y-6" style={{ color: selectedStyle.fontColor, fontFamily: selectedStyle.fontName, fontSize: `${fontSizePx}px` }}>
      {/* Header */}
      <div className="space-y-2">
        <div className="text-lg font-bold">
          {translations?.key || 'Key'}@@ {translations?.forDesign || 'for design'} "%Title%"@@
        </div>
        <div>
          {translations?.designer || 'Designer'}: {designerName || 'Designer Name'}
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-bold">{translations?.canvas || 'Canvas'}:</span> %count% {translations?.count || 'count'}
        </div>
        <div>
          <span className="font-bold">{translations?.size || 'Size'}:</span> %dimcm%count%% {translations?.cmOr || 'cm or'} %stitches% {translations?.stitches || 'stitches'}
        </div>
        <div>
          <span className="font-bold">{translations?.palette || 'Palette'}:</span> %RNG%
        </div>
      </div>

      {/* Warning */}
      <div className="italic text-sm text-[#6B6B6B]">
        {translations?.warning || 'Warning text'}
      </div>

      {/* Cross Stitch Table */}
      <div className="space-y-3">
        <div className="font-bold" style={headerTextStyle}>{translations?.cross || 'Cross Stitch'}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" style={{ borderColor: selectedStyle.borderColor }}>
            <thead>
              <tr>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.color || 'Color'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.color || 'Color'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const oddNum = 2 * i - 1;
                const evenNum = 2 * i;
                return (
                  <tr key={i}>
                    <td style={{ border: borderStyle }} className="p-2 text-center">
                      {oddNum < 10 ? <span style={cellTextStyle}>{`@@%p${oddNum}%`}</span> : (
                        <div className="flex flex-col items-center">
                          <span style={cellTextStyle}>{`@@%p${oddNum}`}</span>
                          <span style={cellTextStyle}>{'%□'}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%s${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%n${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%st${oddNum}%@@`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center">
                      {evenNum < 10 ? <span style={cellTextStyle}>{`@@%p${evenNum}%`}</span> : (
                        <div className="flex flex-col items-center">
                          <span style={cellTextStyle}>{`@@%p${evenNum}`}</span>
                          <span style={cellTextStyle}>{'%□'}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%s${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%n${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%st${evenNum}%@@`}</span></td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={8} className="p-2 text-center text-[#6B6B6B] italic text-xs" style={{ border: borderStyle }}>
                  ... (всего 51 строка) ...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Half Cross Table */}
      <div className="space-y-3">
        <div className="font-bold" style={headerTextStyle}>{translations?.halfCross || 'Half Cross'}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.color || 'Color'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.color || 'Color'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
                const oddNum = 2 * i - 1;
                const evenNum = 2 * i;
                return (
                  <tr key={i}>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%ph${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hs${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hn${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hst${oddNum}%@@`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%ph${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hs${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hn${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%hst${evenNum}%@@`}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Backstitch Table */}
      <div className="space-y-3">
        <div className="font-bold" style={headerTextStyle}>{translations?.backstitch || 'Backstitch'}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => {
                const oddNum = 2 * i - 1;
                const evenNum = 2 * i;
                return (
                  <tr key={i}>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%bs${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%bn${oddNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%bst${oddNum}%@@`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%bs${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%bn${evenNum}%`}</span></td>
                    <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%bst${evenNum}%@@`}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* French Knot Table */}
      <div className="space-y-3">
        <div className="font-bold" style={headerTextStyle}>{translations?.frenchKnot || 'French Knot'}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.colorNumber || 'Color #'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.threads || 'Threads'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <tr key={i}>
                  <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%fs${i}%`}</span></td>
                  <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%fn${i}%`}</span></td>
                  <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`%fst${i}%@@`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beads Table */}
      <div className="space-y-3">
        <div className="font-bold" style={headerTextStyle}>{translations?.beads || 'Beads'}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.symbol || 'Symbol'}
                </th>
                <th style={{ border: borderStyle, backgroundColor: selectedStyle.headerBgColor, color: selectedStyle.accentColor }} className="p-2 font-bold">
                  {translations?.paletteColor || 'Palette, Color'}
                </th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map((i) => (
                <tr key={i}>
                  <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%bds${i}%@@`}</span></td>
                  <td style={{ border: borderStyle }} className="p-2 text-center"><span style={cellTextStyle}>{`@@%BDRNG${i}%, %bdn${i}%, %bdna${i}%@@`}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});