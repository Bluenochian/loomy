import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Plus, FileText, Users, Globe, ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { StoryMapNode } from '@/types/story';

const NODE_CONFIG = {
  chapter: { 
    icon: FileText, 
    color: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
    bgGlow: 'hover:shadow-blue-500/20'
  },
  character: { 
    icon: Users, 
    color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
    bgGlow: 'hover:shadow-emerald-500/20'
  },
  event: { 
    icon: Map, 
    color: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    bgGlow: 'hover:shadow-amber-500/20'
  },
  location: { 
    icon: Globe, 
    color: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
    bgGlow: 'hover:shadow-purple-500/20'
  },
} as const;

type NodeType = keyof typeof NODE_CONFIG;

export default function StoryMapPage() {
  const { storyMapNodes, storyMapEdges, addStoryMapNode, deleteStoryMapNode, chapters, characters } = useStory();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<NodeType>('event');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Group nodes by type for better visualization
  const groupedNodes = useMemo(() => {
    const groups: Record<NodeType, StoryMapNode[]> = {
      chapter: [],
      character: [],
      event: [],
      location: [],
    };
    
    storyMapNodes.forEach(node => {
      const type = node.node_type as NodeType;
      if (groups[type]) {
        groups[type].push(node);
      } else {
        groups.event.push(node);
      }
    });
    
    return groups;
  }, [storyMapNodes]);

  // Find connections for selected node
  const nodeConnections = useMemo(() => {
    if (!selectedNode) return { incoming: [], outgoing: [] };
    
    return {
      incoming: storyMapEdges.filter(e => e.target_node_id === selectedNode),
      outgoing: storyMapEdges.filter(e => e.source_node_id === selectedNode),
    };
  }, [selectedNode, storyMapEdges]);

  const handleAddNode = async () => {
    setIsAdding(true);
    try {
      const node = await addStoryMapNode({
        title: `New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}`,
        node_type: selectedType,
        position_x: Math.random() * 400 + 100,
        position_y: Math.random() * 300 + 100,
      });
      if (node) {
        setSelectedNode(node.id);
        toast({ title: 'Node created' });
      }
    } catch {
      toast({ title: 'Failed to create node', variant: 'destructive' });
    }
    setIsAdding(false);
  };

  const handleDelete = async (nodeId: string) => {
    await deleteStoryMapNode(nodeId);
    if (selectedNode === nodeId) setSelectedNode(null);
    toast({ title: 'Node deleted' });
  };

  const selectedNodeData = storyMapNodes.find(n => n.id === selectedNode);

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in">
      {/* Main Map Area */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-2">
              <Map className="h-7 w-7 text-primary" /> Story Map
            </h1>
            <p className="text-muted-foreground mt-1">Visual representation of your narrative flow</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as NodeType)}
              className="px-3 py-2 rounded-lg bg-secondary text-sm border-none"
            >
              {Object.keys(NODE_CONFIG).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <Button onClick={handleAddNode} disabled={isAdding}>
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add Node
            </Button>
          </div>
        </div>

        {storyMapNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-border rounded-xl">
            <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-xl font-semibold mb-2">Your Story Map is Empty</h3>
            <p className="text-muted-foreground mb-4">Add nodes to visualize your narrative structure</p>
            <Button onClick={handleAddNode}>
              <Plus className="h-4 w-4" /> Create First Node
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Node Type Lanes */}
            {Object.entries(NODE_CONFIG).map(([type, config]) => {
              const nodes = groupedNodes[type as NodeType];
              if (nodes.length === 0) return null;
              
              const Icon = config.icon;
              
              return (
                <div key={type} className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn("p-1.5 rounded", config.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-medium capitalize">{type}s</h3>
                    <Badge variant="secondary" className="text-xs">{nodes.length}</Badge>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {nodes.map((node, index) => (
                      <Card
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className={cn(
                          "min-w-[200px] p-4 cursor-pointer transition-all duration-300 border-2",
                          config.color,
                          config.bgGlow,
                          "hover:shadow-lg",
                          selectedNode === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Icon className="h-5 w-5" />
                          <span className="text-xs opacity-60">#{index + 1}</span>
                        </div>
                        <h4 className="font-semibold truncate mb-1">{node.title}</h4>
                        {node.description && (
                          <p className="text-xs opacity-70 line-clamp-2">{node.description}</p>
                        )}
                      </Card>
                    ))}
                    
                    {/* Connection indicators */}
                    {nodes.length > 1 && (
                      <div className="absolute top-12 left-0 right-0 flex items-center pointer-events-none">
                        {nodes.slice(0, -1).map((_, i) => (
                          <ArrowRight 
                            key={i} 
                            className="h-4 w-4 text-muted-foreground/30 ml-[190px] first:ml-[170px]" 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Panel */}
      <div className="w-80 border-l border-border p-6 bg-card/50 overflow-auto">
        {selectedNodeData ? (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <Badge className={NODE_CONFIG[selectedNodeData.node_type as NodeType]?.color || ''}>
                {selectedNodeData.node_type}
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(selectedNodeData.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            
            <h3 className="font-display text-xl font-semibold mb-2">{selectedNodeData.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {selectedNodeData.description || 'No description yet'}
            </p>

            {/* Connections */}
            <div className="space-y-4">
              {nodeConnections.incoming.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Incoming</h4>
                  <div className="space-y-1">
                    {nodeConnections.incoming.map(edge => {
                      const source = storyMapNodes.find(n => n.id === edge.source_node_id);
                      return source && (
                        <div key={edge.id} className="text-sm p-2 rounded bg-muted/30">
                          ← {source.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {nodeConnections.outgoing.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">Outgoing</h4>
                  <div className="space-y-1">
                    {nodeConnections.outgoing.map(edge => {
                      const target = storyMapNodes.find(n => n.id === edge.target_node_id);
                      return target && (
                        <div key={edge.id} className="text-sm p-2 rounded bg-muted/30">
                          → {target.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30">
              <h4 className="text-sm font-medium mb-3">Story Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Chapters</p>
                  <p className="font-semibold">{chapters.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Characters</p>
                  <p className="font-semibold">{characters.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Map Nodes</p>
                  <p className="font-semibold">{storyMapNodes.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Connections</p>
                  <p className="font-semibold">{storyMapEdges.length}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Map className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium mb-2">Select a Node</h3>
            <p className="text-sm text-muted-foreground">
              Click on any node to view details and connections
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
