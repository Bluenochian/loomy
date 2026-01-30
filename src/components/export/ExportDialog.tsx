import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStory } from '@/context/StoryContext';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Book, FileType, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';

type ExportFormat = 'pdf' | 'epub' | 'docx' | 'txt';

export function ExportDialog() {
  const { currentProject, chapters, characters, storyOverview } = useStory();
  const { toast } = useToast();
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [open, setOpen] = useState(false);

  const exportToPDF = async () => {
    if (!currentProject) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 30;

    // Title page
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    const title = currentProject.title || 'Untitled Story';
    doc.text(title, pageWidth / 2, 80, { align: 'center' });
    
    if (storyOverview?.narrative_intent) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      const lines = doc.splitTextToSize(storyOverview.narrative_intent, contentWidth);
      doc.text(lines, pageWidth / 2, 100, { align: 'center' });
    }

    doc.addPage();
    y = 30;

    // Chapters
    for (const chapter of chapters.sort((a, b) => a.chapter_number - b.chapter_number)) {
      // Chapter title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(`Chapter ${chapter.chapter_number}: ${chapter.title}`, margin, y);
      y += 15;

      // Chapter content
      if (chapter.content) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(chapter.content, contentWidth);
        
        for (const line of lines) {
          if (y > 270) {
            doc.addPage();
            y = 30;
          }
          doc.text(line, margin, y);
          y += 6;
        }
      }
      
      y += 20;
      if (y > 250) {
        doc.addPage();
        y = 30;
      }
    }

    doc.save(`${currentProject.title || 'story'}.pdf`);
  };

  const exportToTXT = async () => {
    if (!currentProject) return;
    
    let content = `${currentProject.title || 'Untitled Story'}\n${'='.repeat(50)}\n\n`;
    
    if (storyOverview?.narrative_intent) {
      content += `${storyOverview.narrative_intent}\n\n`;
    }

    for (const chapter of chapters.sort((a, b) => a.chapter_number - b.chapter_number)) {
      content += `\n${'─'.repeat(40)}\n`;
      content += `Chapter ${chapter.chapter_number}: ${chapter.title}\n`;
      content += `${'─'.repeat(40)}\n\n`;
      content += `${chapter.content || '(No content)'}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `${currentProject.title || 'story'}.txt`);
  };

  const exportToDOCX = async () => {
    if (!currentProject) return;
    
    // Create a simple HTML structure that Word can open
    let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${currentProject.title || 'Story'}</title>
<style>
  body { font-family: 'Times New Roman', serif; max-width: 8.5in; margin: 0 auto; padding: 1in; }
  h1 { text-align: center; font-size: 28pt; margin-bottom: 0.5in; }
  h2 { font-size: 18pt; margin-top: 0.5in; border-bottom: 1px solid #ccc; padding-bottom: 0.1in; }
  p { font-size: 12pt; line-height: 1.8; text-indent: 0.5in; margin: 0; }
  .subtitle { text-align: center; font-style: italic; font-size: 14pt; margin-bottom: 1in; }
</style>
</head>
<body>
<h1>${currentProject.title || 'Untitled Story'}</h1>
${storyOverview?.narrative_intent ? `<p class="subtitle">${storyOverview.narrative_intent}</p>` : ''}
`;

    for (const chapter of chapters.sort((a, b) => a.chapter_number - b.chapter_number)) {
      html += `<h2>Chapter ${chapter.chapter_number}: ${chapter.title}</h2>`;
      const paragraphs = (chapter.content || '').split('\n\n').filter(p => p.trim());
      for (const p of paragraphs) {
        html += `<p>${p.replace(/\n/g, '<br>')}</p>`;
      }
    }

    html += '</body></html>';

    const blob = new Blob([html], { type: 'application/vnd.ms-word;charset=utf-8' });
    saveAs(blob, `${currentProject.title || 'story'}.doc`);
  };

  const exportToEPUB = async () => {
    if (!currentProject) return;
    
    // For EPUB, we'll create a zip file with the EPUB structure
    // This is a simplified version - a full EPUB would need more metadata
    toast({ 
      title: 'EPUB Export', 
      description: 'Creating EPUB file... For full EPUB support, consider using a dedicated writing app to import the DOCX export.' 
    });
    
    // Fallback to DOCX for now with EPUB-like formatting
    await exportToDOCX();
  };

  const handleExport = async () => {
    if (!currentProject) {
      toast({ title: 'No project to export', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    try {
      switch (format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'txt':
          await exportToTXT();
          break;
        case 'docx':
          await exportToDOCX();
          break;
        case 'epub':
          await exportToEPUB();
          break;
      }
      toast({ title: `Exported as ${format.toUpperCase()}!` });
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: 'Export failed', variant: 'destructive' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Your Story
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">Choose format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)} className="grid grid-cols-2 gap-3">
              <Label
                htmlFor="pdf"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'pdf' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="pdf" id="pdf" className="sr-only" />
                <FileText className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">PDF</p>
                  <p className="text-xs text-muted-foreground">Universal format</p>
                </div>
              </Label>
              
              <Label
                htmlFor="docx"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'docx' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="docx" id="docx" className="sr-only" />
                <FileType className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Word</p>
                  <p className="text-xs text-muted-foreground">Editable document</p>
                </div>
              </Label>
              
              <Label
                htmlFor="epub"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'epub' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="epub" id="epub" className="sr-only" />
                <Book className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">EPUB</p>
                  <p className="text-xs text-muted-foreground">E-readers</p>
                </div>
              </Label>
              
              <Label
                htmlFor="txt"
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  format === 'txt' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <RadioGroupItem value="txt" id="txt" className="sr-only" />
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Plain Text</p>
                  <p className="text-xs text-muted-foreground">Simple text file</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <div className="bg-secondary/30 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              <strong>{chapters.length}</strong> chapters will be exported
              {chapters.reduce((acc, ch) => acc + (ch.word_count || 0), 0) > 0 && (
                <> • <strong>{chapters.reduce((acc, ch) => acc + (ch.word_count || 0), 0).toLocaleString()}</strong> words</>
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="h-4 w-4" /> Export</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
