import { useState, useRef, useCallback, useEffect } from 'react';
import { useStory } from '@/context/StoryContext';
import { useSettings } from '@/context/SettingsContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, BookOpen, User, Zap, MapPin, Trash2, Link2, X, Move, Save, Loader2,
  ZoomIn, ZoomOut, Maximize2, Sparkles, RefreshCw, Eye, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { StoryMapNode } from '@/types/story';

const NODE_CONFIG = {
  chapter: { icon: BookOpen, color: 'bg-blue-500/20 border-blue-500/50 hover:bg-blue-500/30', textColor: 'text-blue-400', glowColor: 'shadow-blue-500/30' },
  character: { icon: User, color: 'bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/30', textColor: 'text-emerald-400', glowColor: 'shadow-emerald-500/30' },
  event: { icon: Zap, color: 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30', textColor: 'text-amber-400', glowColor: 'shadow-amber-500/30' },
  location: { icon: MapPin, color: 'bg-purple-500/20 border-purple-500/50 hover:bg-purple-500/30', textColor: 'text-purple-400', glowColor: 'shadow-purple-500/30' },
};

type NodeType = keyof typeof NODE_CONFIG;

export default function StoryMapPage() {
  const { currentProject, storyMapNodes, storyMapEdges, addStoryMapNode, updateStoryMapNode, deleteStoryMapNode, addStoryMapEdge, deleteStoryMapEdge, storyOverview } = useStory();
  const { settings } = useSettings();
  const { t } = useLanguage();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAutoWiring, setIsAutoWiring] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const selectedNodeData = storyMapNodes.find(n => n.id === selectedNode);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingFrom(null);
        setEditingNode(null);
        setSelectedNode(null);
      }
      if (e.key === 'Delete' && selectedNode && !editingNode) {
        handleDeleteNode(selectedNode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, editingNode]);

  const handleAddNode = async (type: NodeType) => {
    const canvas = canvasRef.current;
    const centerX = canvas ? (canvas.clientWidth / 2 - canvasOffset.x) / zoom : 300;
    const centerY = canvas ? (canvas.clientHeight / 2 - canvasOffset.y) / zoom : 200;
    
    const node = await addStoryMapNode({
      node_type: type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position_x: centerX + (Math.random() - 0.5) * 150,
      position_y: centerY + (Math.random() - 0.5) * 100,
      description: '',
    });
    if (node) {
      setSelectedNode(node.id);
      toast({ title: `${type} node created` });
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        addStoryMapEdge({ source_node_id: connectingFrom, target_node_id: nodeId, edge_type: 'sequence' });
        toast({ title: 'Connection created' });
      }
      setConnectingFrom(null);
      return;
    }
    
    setDraggingNode(nodeId);
    setSelectedNode(nodeId);
    const node = storyMapNodes.find(n => n.id === nodeId);
    if (node) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left - (node.position_x * zoom + canvasOffset.x),
          y: e.clientY - rect.top - (node.position_y * zoom + canvasOffset.y),
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (draggingNode) {
      const newX = (e.clientX - rect.left - dragOffset.x - canvasOffset.x) / zoom;
      const newY = (e.clientY - rect.top - dragOffset.y - canvasOffset.y) / zoom;
      updateStoryMapNode(draggingNode, { position_x: Math.max(0, newX), position_y: Math.max(0, newY) });
    } else if (isPanning) {
      setCanvasOffset({
        x: canvasOffset.x + (e.clientX - panStart.x),
        y: canvasOffset.y + (e.clientY - panStart.y),
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, canvasOffset, isPanning, panStart, zoom, updateStoryMapNode]);

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setSelectedNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(2, Math.max(0.3, z + delta)));
  };

  const startEditing = (node: StoryMapNode) => {
    setEditingNode(node.id);
    setEditTitle(node.title);
    setEditDescription(node.description || '');
  };

  const saveEditing = async () => {
    if (!editingNode) return;
    setIsSaving(true);
    await updateStoryMapNode(editingNode, { title: editTitle, description: editDescription });
    setEditingNode(null);
    setIsSaving(false);
    toast({ title: 'Node updated' });
  };

  const handleDeleteNode = async (nodeId: string) => {
    await deleteStoryMapNode(nodeId);
    if (selectedNode === nodeId) setSelectedNode(null);
    toast({ title: 'Node deleted' });
  };

  const handleDeleteEdge = async (edgeId: string) => {
    await deleteStoryMapEdge(edgeId);
    toast({ title: 'Connection removed' });
  };

  const resetView = () => {
    setZoom(1);
    setCanvasOffset({ x: 0, y: 0 });
  };

  const analyzeWithAI = async () => {
    if (!currentProject) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const context = `
Story: ${currentProject.title}
Concept: ${currentProject.concept}
Genre: ${currentProject.genre_influences?.join(', ') || 'General'}
${storyOverview?.narrative_intent ? `Intent: ${storyOverview.narrative_intent}` : ''}
      `.trim();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'analyze_story_map',
          context,
          storyMapData: {
            nodes: storyMapNodes.map(n => ({ id: n.id, title: n.title, type: n.node_type, description: n.description })),
            edges: storyMapEdges.map(e => ({ source: e.source_node_id, target: e.target_node_id, label: e.label })),
          },
          settings: { temperature: settings.aiTemperature, model: settings.aiModel },
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');
      const data = await response.json();
      setAnalysisResult(data.result);
      toast({ title: 'Analysis complete!' });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ title: 'Analysis failed', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // AI Auto-Wire: Actually creates the connections suggested by AI
  const autoWireWithAI = async () => {
    if (!currentProject || storyMapNodes.length < 2) {
      toast({ title: 'Need at least 2 nodes to auto-wire', variant: 'destructive' });
      return;
    }
    setIsAutoWiring(true);

    try {
      const context = `
Story: ${currentProject.title}
Concept: ${currentProject.concept}
Genre: ${currentProject.genre_influences?.join(', ') || 'General'}
${storyOverview?.narrative_intent ? `Intent: ${storyOverview.narrative_intent}` : ''}
      `.trim();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          action: 'auto_wire_story_map',
          context,
          storyMapData: {
            nodes: storyMapNodes.map(n => ({ id: n.id, title: n.title, type: n.node_type, description: n.description })),
            edges: storyMapEdges.map(e => ({ source: e.source_node_id, target: e.target_node_id })),
          },
          settings: { temperature: 0.7, model: settings.aiModel },
        }),
      });

      if (!response.ok) throw new Error('Auto-wire failed');
      const data = await response.json();
      
      // Create the suggested connections
      const connections = data.result?.connections || [];
      let created = 0;
      
      for (const conn of connections) {
        // Find nodes by title or id
        const sourceNode = storyMapNodes.find(n => n.id === conn.sourceId || n.title === conn.sourceTitle);
        const targetNode = storyMapNodes.find(n => n.id === conn.targetId || n.title === conn.targetTitle);
        
        if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
          // Check if connection already exists
          const exists = storyMapEdges.some(
            e => (e.source_node_id === sourceNode.id && e.target_node_id === targetNode.id) ||
                 (e.source_node_id === targetNode.id && e.target_node_id === sourceNode.id)
          );
          
          if (!exists) {
            await addStoryMapEdge({
              source_node_id: sourceNode.id,
              target_node_id: targetNode.id,
              edge_type: conn.type || 'sequence',
              label: conn.label,
            });
            created++;
          }
        }
      }
      
      toast({ title: `Created ${created} new connections!` });
    } catch (error) {
      console.error('Auto-wire error:', error);
      toast({ title: 'Auto-wire failed', variant: 'destructive' });
    } finally {
      setIsAutoWiring(false);
    }
  };

  return (
    <div className="h-full min-h-[calc(100vh-4rem)] flex animate-fade-in" ref={containerRef}>
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative bg-gradient-to-br from-secondary/20 via-background to-secondary/10 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none canvas-bg"
          style={{
            backgroundImage: `
              linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
            `,
            backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
            transform: `translate(${canvasOffset.x % (30 * zoom)}px, ${canvasOffset.y % (30 * zoom)}px)`,
          }}
        />

        {/* SVG Edges */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" opacity="0.7" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {storyMapEdges.map(edge => {
            const source = storyMapNodes.find(n => n.id === edge.source_node_id);
            const target = storyMapNodes.find(n => n.id === edge.target_node_id);
            if (!source || !target) return null;
            
            const x1 = source.position_x + 70;
            const y1 = source.position_y + 35;
            const x2 = target.position_x + 70;
            const y2 = target.position_y + 35;
            
            // Create curved path
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const curvature = Math.min(50, Math.sqrt(dx * dx + dy * dy) / 4);
            const controlX = midX - dy * 0.2;
            const controlY = midY + dx * 0.2;
            
            return (
              <g key={edge.id}>
                <path
                  d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeOpacity={0.5}
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  filter="url(#glow)"
                />
                {/* Clickable hitbox for deletion */}
                <path
                  d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                  stroke="transparent"
                  strokeWidth={20}
                  fill="none"
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => handleDeleteEdge(edge.id)}
                />
                {edge.label && (
                  <text x={controlX} y={controlY} fill="hsl(var(--muted-foreground))" fontSize={10} textAnchor="middle">
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${zoom})`, transformOrigin: '0 0' }}>
          {storyMapNodes.map(node => {
            const config = NODE_CONFIG[node.node_type as NodeType] || NODE_CONFIG.event;
            const Icon = config.icon;
            const isSelected = selectedNode === node.id;
            const isConnecting = connectingFrom === node.id;
            
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute w-[140px] p-3 rounded-xl border-2 cursor-move transition-all duration-200 select-none backdrop-blur-sm",
                  config.color,
                  isSelected && "ring-2 ring-primary shadow-lg scale-105",
                  isSelected && config.glowColor && `shadow-xl ${config.glowColor}`,
                  isConnecting && "ring-2 ring-accent animate-pulse",
                  draggingNode === node.id && "opacity-90 shadow-2xl scale-110"
                )}
                style={{ left: node.position_x, top: node.position_y }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onDoubleClick={() => startEditing(node)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("h-4 w-4", config.textColor)} />
                  <Badge variant="outline" className={cn("text-[10px] px-1.5", config.textColor)}>
                    {node.node_type}
                  </Badge>
                </div>
                <p className="text-sm font-medium truncate">{node.title}</p>
                {node.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">{node.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {storyMapNodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <Move className="h-16 w-16 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-lg">{t('map.addNode')}</p>
            <p className="text-muted-foreground text-sm">Drag to move • Double-click to edit • Click edges to delete</p>
          </div>
        )}

        {/* Connecting mode indicator */}
        {connectingFrom && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium animate-pulse shadow-lg">
            Click another node to connect, or press ESC to cancel
          </div>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border">
          <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.min(2, z + 0.2))} className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button size="icon" variant="ghost" onClick={resetView} className="h-8 w-8" title={t('map.resetView')}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l border-border bg-card/50 flex flex-col overflow-hidden">
        {/* Add Nodes */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> {t('map.addNode')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(NODE_CONFIG) as [NodeType, typeof NODE_CONFIG.chapter][]).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddNode(type)}
                  className={cn("gap-1.5 capitalize", config.color, config.textColor)}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`map.${type}` as any) || type}
                </Button>
              );
            })}
          </div>
        </div>

        {/* AI Actions */}
        <div className="p-4 border-b border-border space-y-2">
          <Button 
            onClick={analyzeWithAI} 
            disabled={isAnalyzing || storyMapNodes.length === 0}
            className="w-full gap-2"
            variant="outline"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> {t('map.aiAnalyze')}</>
            )}
          </Button>
          
          <Button 
            onClick={autoWireWithAI} 
            disabled={isAutoWiring || storyMapNodes.length < 2}
            className="w-full gap-2"
            variant="default"
          >
            {isAutoWiring ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Auto-wiring...</>
            ) : (
              <><Wand2 className="h-4 w-4" /> {t('map.aiAutoWire')}</>
            )}
          </Button>
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <div className="p-4 border-b border-border space-y-3 max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> {t('map.insights')}
            </h4>
            {analysisResult.analysis && (
              <p className="text-xs text-muted-foreground">{analysisResult.analysis}</p>
            )}
            {analysisResult.suggestedConnections?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Suggested Connections:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {analysisResult.suggestedConnections.slice(0, 3).map((c: any, i: number) => (
                    <li key={i}>• {c.sourceTitle} → {c.targetTitle}</li>
                  ))}
                </ul>
              </div>
            )}
            {analysisResult.issues?.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Potential Issues:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {analysisResult.issues.slice(0, 3).map((issue: string, i: number) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Selected Node Details */}
        {selectedNodeData && !editingNode && (
          <div className="p-4 border-b border-border space-y-3 flex-1 overflow-y-auto">
            <h3 className="font-semibold">{t('map.selectedNode')}</h3>
            <Card className={cn("p-3", NODE_CONFIG[selectedNodeData.node_type as NodeType]?.color)}>
              <p className="font-medium">{selectedNodeData.title}</p>
              {selectedNodeData.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedNodeData.description}</p>
              )}
            </Card>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEditing(selectedNodeData)} className="flex-1">
                {t('common.edit')}
              </Button>
              <Button 
                size="sm" 
                variant={connectingFrom === selectedNodeData.id ? "default" : "outline"} 
                onClick={() => setConnectingFrom(connectingFrom === selectedNodeData.id ? null : selectedNodeData.id)} 
                className="flex-1 gap-1"
              >
                <Link2 className="h-3 w-3" />
                {connectingFrom === selectedNodeData.id ? t('common.cancel') : t('map.connect')}
              </Button>
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteNode(selectedNodeData.id)} className="w-full gap-1">
              <Trash2 className="h-3 w-3" /> {t('common.delete')}
            </Button>
          </div>
        )}

        {/* Editing Mode */}
        {editingNode && (
          <div className="p-4 border-b border-border space-y-3 flex-1 overflow-y-auto">
            <h3 className="font-semibold">{t('map.editNode')}</h3>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="bg-secondary/50"
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description..."
              className="bg-secondary/50 min-h-[80px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEditing} disabled={isSaving} className="flex-1 gap-1">
                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                {t('common.save')}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingNode(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Connections List */}
        {storyMapEdges.length > 0 && (
          <div className="p-4 border-b border-border space-y-2 max-h-48 overflow-y-auto">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" /> {t('map.connections')} ({storyMapEdges.length})
            </h3>
            <div className="space-y-1">
              {storyMapEdges.map(edge => {
                const source = storyMapNodes.find(n => n.id === edge.source_node_id);
                const target = storyMapNodes.find(n => n.id === edge.target_node_id);
                if (!source || !target) return null;
                
                return (
                  <div 
                    key={edge.id} 
                    className="flex items-center justify-between p-2 bg-secondary/30 rounded text-xs group hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-1 truncate flex-1">
                      <span className="truncate max-w-[70px]">{source.title}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="truncate max-w-[70px]">{target.title}</span>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteEdge(edge.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 mt-auto border-t border-border">
          <h3 className="font-semibold mb-3">{t('map.stats')}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-secondary/30 rounded">
              <p className="text-muted-foreground text-xs">{t('map.nodes')}</p>
              <p className="font-bold">{storyMapNodes.length}</p>
            </div>
            <div className="p-2 bg-secondary/30 rounded">
              <p className="text-muted-foreground text-xs">{t('map.connections')}</p>
              <p className="font-bold">{storyMapEdges.length}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Click edges on canvas to delete • Select node + Connect to link
          </p>
        </div>
      </div>
    </div>
  );
}
