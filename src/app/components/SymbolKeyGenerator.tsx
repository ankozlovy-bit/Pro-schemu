import { Download, Printer, FileText, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ProjectData, FlossColor } from '../types';
import { useRef } from 'react';
import { getMultiLangText, SupportedLanguage, getLanguageName } from '../utils/keyGeneratorTranslations';

interface SymbolKeyGeneratorProps {
  projectData: ProjectData;
}

export default function SymbolKeyGenerator({ projectData }: SymbolKeyGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Get selected languages or default to Russian and English
  const selectedLanguages = (projectData.symbolKeyLanguages as SupportedLanguage[]) || ['ru', 'en'];

  // Helper function to get multi-language text
  const t = (key: Parameters<typeof getMultiLangText>[1]) => {
    return getMultiLangText(selectedLanguages, key);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ключ для дизайна - ${projectData.chartTitle || 'Untitled'}</title>
              <style>
                @page { size: A4; margin: 20mm; }
                body { 
                  font-family: 'Inter', -apple-system, sans-serif; 
                  padding: 20px;
                  color: #2D2D2D;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 30px;
                  border-bottom: 2px solid #2D2D2D;
                  padding-bottom: 20px;
                }
                .header h1 { 
                  font-family: 'Playfair Display', serif;
                  font-size: 24px; 
                  margin: 10px 0;
                  font-weight: 600;
                }
                .header h2 { 
                  font-size: 18px; 
                  color: #6B6B6B; 
                  margin: 5px 0;
                  font-style: italic;
                }
                .info { 
                  font-size: 14px; 
                  color: #6B6B6B; 
                  margin: 5px 0;
                }
                .warning {
                  background: #FFF3CD;
                  padding: 15px;
                  border-radius: 8px;
                  margin: 20px 0;
                  font-size: 13px;
                  border-left: 4px solid #FFC107;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 20px 0;
                  font-size: 12px;
                }
                th { 
                  background: #E8F0E8; 
                  padding: 10px; 
                  text-align: left;
                  font-weight: 600;
                  border: 1px solid #D0D0D0;
                }
                td { 
                  padding: 8px; 
                  border: 1px solid #D0D0D0;
                  text-align: center;
                }
                .color-box { 
                  width: 30px; 
                  height: 30px; 
                  border: 1px solid #999;
                  display: inline-block;
                  border-radius: 4px;
                }
                .symbol { 
                  font-size: 20px; 
                  font-weight: bold;
                }
                .section-title {
                  font-size: 16px;
                  font-weight: 600;
                  margin: 25px 0 15px 0;
                  color: #2D2D2D;
                  border-bottom: 2px solid #E8F0E8;
                  padding-bottom: 8px;
                }
                .double-column {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleDownloadHTML = () => {
    if (printRef.current) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ключ для дизайна - ${projectData.chartTitle || 'Untitled'}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      color: #2D2D2D;
      background: white;
    }
    .header { 
      text-align: center; 
      margin-bottom: 30px;
      border-bottom: 2px solid #2D2D2D;
      padding-bottom: 20px;
    }
    .header h1 { 
      font-family: 'Playfair Display', serif;
      font-size: 24px; 
      margin: 10px 0;
      font-weight: 600;
    }
    .header h2 { 
      font-size: 18px; 
      color: #6B6B6B; 
      margin: 5px 0;
      font-style: italic;
    }
    .info { 
      font-size: 14px; 
      color: #6B6B6B; 
      margin: 5px 0;
    }
    .warning {
      background: #FFF3CD;
      padding: 15px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 13px;
      border-left: 4px solid #FFC107;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 20px 0;
      font-size: 12px;
    }
    th { 
      background: #E8F0E8; 
      padding: 10px; 
      text-align: left;
      font-weight: 600;
      border: 1px solid #D0D0D0;
    }
    td { 
      padding: 8px; 
      border: 1px solid #D0D0D0;
      text-align: center;
    }
    .color-box { 
      width: 30px; 
      height: 30px; 
      border: 1px solid #999;
      display: inline-block;
      border-radius: 4px;
    }
    .symbol { 
      font-size: 20px; 
      font-weight: bold;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      margin: 25px 0 15px 0;
      color: #2D2D2D;
      border-bottom: 2px solid #E8F0E8;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  ${printRef.current.innerHTML}
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Symbol-Key-${projectData.chartTitle || 'Untitled'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderColorTable = (
    translationKey: 'crossStitch' | 'halfCrossStitch' | 'backstitch' | 'frenchKnots',
    colors: FlossColor[],
    doubleColumn: boolean = false
  ) => {
    if (!colors || colors.length === 0) return null;

    const visibleColors = colors.filter(c => c.visible);
    if (visibleColors.length === 0) return null;

    const sectionTitle = t(translationKey);
    const colorHeader = t('color');
    const symbolHeader = t('symbol');
    const colorNumberHeader = t('colorNumber');
    const threadsHeader = t('threads');

    if (doubleColumn) {
      // Split into two columns
      const half = Math.ceil(visibleColors.length / 2);
      const leftColumn = visibleColors.slice(0, half);
      const rightColumn = visibleColors.slice(half);

      return (
        <div className="mb-6">
          <div className="section-title">
            {sectionTitle}
          </div>
          <table>
            <thead>
              <tr>
                <th>{colorHeader}</th>
                <th>{symbolHeader}</th>
                <th>{colorNumberHeader}</th>
                <th>{threadsHeader}</th>
                <th style={{ width: '20px' }}></th>
                <th>{colorHeader}</th>
                <th>{symbolHeader}</th>
                <th>{colorNumberHeader}</th>
                <th>{threadsHeader}</th>
              </tr>
            </thead>
            <tbody>
              {leftColumn.map((leftColor, index) => {
                const rightColor = rightColumn[index];
                return (
                  <tr key={leftColor.id}>
                    <td>
                      <div
                        className="color-box"
                        style={{ backgroundColor: leftColor.hex }}
                      ></div>
                    </td>
                    <td className="symbol">{leftColor.symbol}</td>
                    <td>{leftColor.dmc}</td>
                    <td>{leftColor.strands}</td>
                    <td style={{ background: '#f5f5f5' }}></td>
                    {rightColor ? (
                      <>
                        <td>
                          <div
                            className="color-box"
                            style={{ backgroundColor: rightColor.hex }}
                          ></div>
                        </td>
                        <td className="symbol">{rightColor.symbol}</td>
                        <td>{rightColor.dmc}</td>
                        <td>{rightColor.strands}</td>
                      </>
                    ) : (
                      <>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div className="mb-6">
        <div className="section-title">
          {sectionTitle}
        </div>
        <table>
          <thead>
            <tr>
              <th>{colorHeader}</th>
              <th>{symbolHeader}</th>
              <th>{colorNumberHeader}</th>
              <th>{threadsHeader}</th>
              <th>{colorHeader}</th>
              <th>{symbolHeader}</th>
              <th>{colorNumberHeader}</th>
              <th>{threadsHeader}</th>
            </tr>
          </thead>
          <tbody>
            {visibleColors.map((color) => (
              <tr key={color.id}>
                <td>
                  <div
                    className="color-box"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                </td>
                <td className="symbol">{color.symbol}</td>
                <td>{color.dmc}</td>
                <td>{color.strands}</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/60 backdrop-blur-sm border-[#2D2D2D]/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#2D2D2D]" />
            <div>
              <h3 className="text-lg font-medium">Ключ для дизайна</h3>
              <p className="text-sm text-[#6B6B6B]">
                Документ с таблицами символов и инструкциями
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadHTML}
              variant="outline"
              className="rounded-xl border-[#2D2D2D]/20 hover:bg-[#E8F0E8]/50"
            >
              <Download className="w-4 h-4 mr-2" />
              Скачать HTML
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-[#2D2D2D] hover:bg-[#2D2D2D]/90 text-white rounded-xl"
            >
              <Printer className="w-4 h-4 mr-2" />
              Печать
            </Button>
          </div>
        </div>

        {/* Language Info Banner */}
        {selectedLanguages.length > 0 && (
          <div className="mb-4 p-4 bg-[#E8F0E8] rounded-xl border border-[#8B9D83]/30 flex items-center gap-3">
            <Languages className="w-5 h-5 text-[#8B9D83]" />
            <div className="flex-1">
              <div className="text-sm font-medium text-[#4A5A44]">
                Мультиязычный режим активирован
              </div>
              <div className="text-xs text-[#6B7B65] mt-1">
                Языки: {selectedLanguages.map(lang => getLanguageName(lang as SupportedLanguage)).join(' → ')}
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="bg-white rounded-lg border-2 border-[#2D2D2D]/10 p-8 max-h-[800px] overflow-auto">
          <div ref={printRef}>
            <div className="header">
              <h1 style={{ fontFamily: 'var(--font-serif)' }}>
                {t('mainTitle')}
              </h1>
              <h2 style={{ fontFamily: 'var(--font-serif)' }}>
                "{projectData.chartTitle || 'Untitled Design'}"
              </h2>
              <div className="info">
                {t('designer')}: {projectData.designerName || projectData.settings?.designerNameRU || 'Unknown'}
              </div>
              {projectData.settings?.designerNameRU && (
                <div className="info" style={{ fontSize: '12px', marginTop: '8px' }}>
                  <a href="#" style={{ color: '#4169E1', textDecoration: 'none' }}>{t('communityLink')}</a>
                </div>
              )}
            </div>

            <div className="info" style={{ marginBottom: '10px' }}>
              <strong>{t('fabric')}:</strong> {projectData.canvasCount || 14} {t('count')}
            </div>
            <div className="info" style={{ marginBottom: '10px' }}>
              <strong>{t('size')}:</strong> {projectData.chartWidth || 0} × {projectData.chartHeight || 0} {t('stitches')}
            </div>
            <div className="info" style={{ marginBottom: '20px' }}>
              <strong>{t('palette')}:</strong> {projectData.flossRange || 'DMC'}
            </div>

            <div className="warning">
              <strong>!!!{t('warningMessage')}!!!</strong>
            </div>

            {renderColorTable(
              'crossStitch',
              projectData.crossStitchColors || [],
              true
            )}

            {renderColorTable(
              'halfCrossStitch',
              projectData.halfStitchColors || [],
              false
            )}

            {renderColorTable(
              'backstitch',
              projectData.backstitchColors || [],
              false
            )}

            {renderColorTable(
              'frenchKnots',
              projectData.frenchKnotColors || [],
              false
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}