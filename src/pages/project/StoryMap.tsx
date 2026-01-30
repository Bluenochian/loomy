import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Map, Plus, FileText, Users, Globe, Loader2, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeType | 'all'>('all');
  const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Filter nodes based on search and category
  const filteredNodes = useMemo(() => {
    let nodes = storyMapNodes;
    
    if (activeCategory !== 'all') {
      nodes = nodes.filter(n => n.node_type === activeCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      nodes = nodes.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.description?.toLowerCase().includes(query)
      );
    }
    
    return nodes;
  }, [storyMapNodes, activeCategory, searchQuery]);

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

  const scrollLane = (type: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[type];
    if (container) {
      const scrollAmount = 240; // Card width + gap
      container.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const navigateToNode = (nodeId: string, nodeType: string) => {
    setSelectedNode(nodeId);
    setActiveCategory('all');
    // Find the node element and scroll into view
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (nodeElement) {
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const selectedNodeData = storyMapNodes.find(n => n.id === selectedNode);

  return (
    <div className="h-[calc(100vh-4rem)] flex animate-fade-in">
      {/* Node Navigator Sidebar */}
      <div className="w-64 border-r border-border flex flex-col bg-card/30">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" /> Navigator
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="pl-9 bg-secondary/50"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1 p-3 border-b border-border">
          <Button
            variant={activeCategory === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className="text-xs h-7"
          >
            All ({storyMapNodes.length})
          </Button>
          {Object.entries(NODE_CONFIG).map(([type, config]) => {
            const count = groupedNodes[type as NodeType].length;
            if (count === 0) return null;
            const Icon = config.icon;
            return (
              <Button
                key={type}
                variant={activeCategory === type ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(type as NodeType)}
                className={cn("text-xs h-7 gap-1", activeCategory === type && config.color)}
              >
                <Icon className="h-3 w-3" />
                {count}
              </Button>
            );
          })}
        </div>

        {/* Scrollable Node List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {filteredNodes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No nodes found
              </p>
            ) : (
              filteredNodes.map(node => {
                const config = NODE_CONFIG[node.node_type as NodeType] || NODE_CONFIG.event;
                const Icon = config.icon;
                return (
                  <button
                    key={node.id}
                    onClick={() => navigateToNode(node.id, node.node_type)}
                    className={cn(
                      "w-full text-left p-2 rounded-lg transition-all duration-200 flex items-center gap-2",
                      config.color,
                      "hover:opacity-80",
                      selectedNode === node.id && "ring-2 ring-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="text-sm truncate">{node.title}</span>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold flex items-center gap-2">
                <Map className="h-6 w-6 text-primary" /> Story Map
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Visual representation of your narrative flow</p>
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
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1 p-6">
          {storyMapNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border rounded-xl">
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded", config.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="font-medium capitalize">{type}s</h3>
                        <Badge variant="secondary" className="text-xs">{nodes.length}</Badge>
                      </div>
                      
                      {/* Scroll Controls */}
                      {nodes.length > 3 && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => scrollLane(type, 'left')}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => scrollLane(type, 'right')}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      ref={(el) => { scrollRefs.current[type] = el; }}
                      className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {nodes.map((node, index) => (
                        <Card
                          key={node.id}
                          id={`node-${node.id}`}
                          onClick={() => setSelectedNode(node.id)}
                          className={cn(
                            "min-w-[220px] max-w-[220px] p-4 cursor-pointer transition-all duration-300 border-2 shrink-0",
                            config.color,
                            config.bgGlow,
                            "hover:shadow-lg",
                            selectedNode === node.id && "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105"
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Icon className="h-5 w-5" />
                            <span className="text-xs opacity-60">#{index + 1}</span>
                          </div>
                          <h4 className="font-semibold truncate mb-1">{node.title}</h4>
                          {node.description && (
                            <p className="text-xs opacity-70 line-clamp-3">{node.description}</p>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Details Panel */}
      <div className="w-80 border-l border-border bg-card/50 flex flex-col">
        <ScrollArea className="flex-1 p-6">
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
                          <button
                            key={edge.id}
                            onClick={() => navigateToNode(source.id, source.node_type)}
                            className="w-full text-left text-sm p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            ← {source.title}
                          </button>
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
                          <button
                            key={edge.id}
                            onClick={() => navigateToNode(target.id, target.node_type)}
                            className="w-full text-left text-sm p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            → {target.title}
                          </button>
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
        </ScrollArea>
      </div>
    </div>
  );
}
