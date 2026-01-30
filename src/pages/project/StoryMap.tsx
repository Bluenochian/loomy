import { useState, useRef, useCallback, useEffect } from 'react';
import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, User, Zap, MapPin, Trash2, Link2, X, Move, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { StoryMapNode } from '@/types/story';

const NODE_CONFIG = {
  chapter: { icon: BookOpen, color: 'bg-blue-500/20 border-blue-500/50', textColor: 'text-blue-400' },
  character: { icon: User, color: 'bg-emerald-500/20 border-emerald-500/50', textColor: 'text-emerald-400' },
  event: { icon: Zap, color: 'bg-amber-500/20 border-amber-500/50', textColor: 'text-amber-400' },
  location: { icon: MapPin, color: 'bg-purple-500/20 border-purple-500/50', textColor: 'text-purple-400' },
};

type NodeType = keyof typeof NODE_CONFIG;

export default function StoryMapPage() {
  const { storyMapNodes, storyMapEdges, addStoryMapNode, updateStoryMapNode, deleteStoryMapNode, addStoryMapEdge, deleteStoryMapEdge } = useStory();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  
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

  const selectedNodeData = storyMapNodes.find(n => n.id === selectedNode);

  const handleAddNode = async (type: NodeType) => {
    const canvas = canvasRef.current;
    const centerX = canvas ? (canvas.clientWidth / 2 - canvasOffset.x) : 300;
    const centerY = canvas ? (canvas.clientHeight / 2 - canvasOffset.y) : 200;
    
    const node = await addStoryMapNode({
      node_type: type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      position_x: centerX + (Math.random() - 0.5) * 100,
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
      setDragOffset({
        x: e.clientX - node.position_x - canvasOffset.x,
        y: e.clientY - node.position_y - canvasOffset.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggingNode) {
      const newX = e.clientX - dragOffset.x - canvasOffset.x;
      const newY = e.clientY - dragOffset.y - canvasOffset.y;
      updateStoryMapNode(draggingNode, { position_x: Math.max(0, newX), position_y: Math.max(0, newY) });
    } else if (isPanning) {
      setCanvasOffset({
        x: canvasOffset.x + (e.clientX - panStart.x),
        y: canvasOffset.y + (e.clientY - panStart.y),
      });
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [draggingNode, dragOffset, canvasOffset, isPanning, panStart, updateStoryMapNode]);

  const handleMouseUp = () => {
    setDraggingNode(null);
    setIsPanning(false);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
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

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in">
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative bg-secondary/10 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseDown={handleCanvasMouseDown}
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            transform: `translate(${canvasOffset.x % 30}px, ${canvasOffset.y % 30}px)`,
          }}
        />

        {/* SVG Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)` }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" opacity="0.6" />
            </marker>
          </defs>
          {storyMapEdges.map(edge => {
            const source = storyMapNodes.find(n => n.id === edge.source_node_id);
            const target = storyMapNodes.find(n => n.id === edge.target_node_id);
            if (!source || !target) return null;
            
            const x1 = source.position_x + 70;
            const y1 = source.position_y + 35;
            const x2 = target.position_x + 70;
            const y2 = target.position_y + 35;
            
            return (
              <g key={edge.id}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeOpacity={0.4}
                  markerEnd="url(#arrowhead)"
                />
                {/* Clickable hitbox for deletion */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="transparent"
                  strokeWidth={15}
                  className="cursor-pointer pointer-events-auto"
                  onClick={() => handleDeleteEdge(edge.id)}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)` }}>
          {storyMapNodes.map(node => {
            const config = NODE_CONFIG[node.node_type as NodeType] || NODE_CONFIG.event;
            const Icon = config.icon;
            const isSelected = selectedNode === node.id;
            const isConnecting = connectingFrom === node.id;
            
            return (
              <div
                key={node.id}
                className={cn(
                  "absolute w-[140px] p-3 rounded-xl border-2 cursor-move transition-all duration-150 select-none",
                  config.color,
                  isSelected && "ring-2 ring-primary shadow-xl scale-105",
                  isConnecting && "ring-2 ring-accent animate-pulse",
                  draggingNode === node.id && "opacity-80 shadow-2xl"
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
            <p className="text-muted-foreground text-lg">Add nodes from the sidebar</p>
            <p className="text-muted-foreground text-sm">Drag to move • Double-click to edit • Click edges to delete</p>
          </div>
        )}

        {/* Connecting mode indicator */}
        {connectingFrom && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium animate-pulse">
            Click another node to connect, or press ESC to cancel
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="w-72 border-l border-border bg-card/50 flex flex-col">
        {/* Add Nodes */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" /> Add Node
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
                  {type}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNodeData && !editingNode && (
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="font-semibold">Selected Node</h3>
            <Card className={cn("p-3", NODE_CONFIG[selectedNodeData.node_type as NodeType]?.color)}>
              <p className="font-medium">{selectedNodeData.title}</p>
              {selectedNodeData.description && (
                <p className="text-sm text-muted-foreground mt-1">{selectedNodeData.description}</p>
              )}
            </Card>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEditing(selectedNodeData)} className="flex-1">
                Edit
              </Button>
              <Button 
                size="sm" 
                variant={connectingFrom === selectedNodeData.id ? "default" : "outline"} 
                onClick={() => setConnectingFrom(connectingFrom === selectedNodeData.id ? null : selectedNodeData.id)} 
                className="flex-1 gap-1"
              >
                <Link2 className="h-3 w-3" />
                {connectingFrom === selectedNodeData.id ? 'Cancel' : 'Connect'}
              </Button>
            </div>
            <Button size="sm" variant="destructive" onClick={() => handleDeleteNode(selectedNodeData.id)} className="w-full gap-1">
              <Trash2 className="h-3 w-3" /> Delete Node
            </Button>
          </div>
        )}

        {/* Editing Mode */}
        {editingNode && (
          <div className="p-4 border-b border-border space-y-3">
            <h3 className="font-semibold">Edit Node</h3>
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
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingNode(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="p-4 mt-auto border-t border-border">
          <h3 className="font-semibold mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-secondary/30 rounded">
              <p className="text-muted-foreground text-xs">Nodes</p>
              <p className="font-bold">{storyMapNodes.length}</p>
            </div>
            <div className="p-2 bg-secondary/30 rounded">
              <p className="text-muted-foreground text-xs">Connections</p>
              <p className="font-bold">{storyMapEdges.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
