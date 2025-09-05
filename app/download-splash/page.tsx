'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

export default function DownloadSplashPage() {
  const downloadSVG = () => {
    const link = document.createElement('a');
    link.href = '/splash-screen-static.svg';
    link.download = 'equal-splash-screen.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPNG = async () => {
    try {
      // Create a canvas to convert SVG to PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      canvas.width = 390;
      canvas.height = 844;
      
      img.onload = () => {
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'equal-splash-screen.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      };
      
      // Convert SVG to data URL
      const svgResponse = await fetch('/splash-screen-static.svg');
      const svgText = await svgResponse.text();
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      img.src = svgUrl;
    } catch (error) {
      console.error('Error converting to PNG:', error);
      alert('Error converting to PNG. Please try downloading the SVG instead.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-card border-white/20">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              Download Splash Screen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-[195px] h-[422px] border border-white/20 rounded-lg overflow-hidden">
                <img 
                  src="/splash-screen-static.svg" 
                  alt="Splash Screen Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            
            {/* Download Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={downloadSVG}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download SVG (Vector)
              </Button>
              
              <Button 
                onClick={downloadPNG}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG (Raster)
              </Button>
            </div>
            
            {/* Info */}
            <div className="text-center text-white/70 text-sm space-y-2">
              <p>SVG format is recommended for scalability and smaller file size.</p>
              <p>PNG format is better for use in applications that don't support SVG.</p>
              <p>Dimensions: 390 × 844 pixels (Mobile optimized)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}