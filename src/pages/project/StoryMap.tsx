import { useStory } from '@/context/StoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Map, Plus, FileText, Users, Globe, Loader2, Trash2, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<NodeType | 'all'>('all');

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

  const navigateToNode = (nodeId: string) => {
    setSelectedNode(nodeId);
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
                    onClick={() => navigateToNode(node.id)}
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

      {/* Main Content Area */}
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

        {/* Selected Node Display */}
        <div className="flex-1 p-8 overflow-auto bg-gradient-to-br from-background via-background to-secondary/20">
          {storyMapNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border rounded-xl">
              <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Your Story Map is Empty</h3>
              <p className="text-muted-foreground mb-4">Add nodes to visualize your narrative structure</p>
              <Button onClick={handleAddNode}>
                <Plus className="h-4 w-4" /> Create First Node
              </Button>
            </div>
          ) : selectedNodeData ? (
            <div className="max-w-2xl mx-auto animate-fade-in">
              {/* Selected Node Card */}
              {(() => {
                const config = NODE_CONFIG[selectedNodeData.node_type as NodeType] || NODE_CONFIG.event;
                const Icon = config.icon;
                return (
                  <Card className={cn(
                    "p-8 border-2 transition-all duration-300",
                    config.color,
                    "shadow-lg"
                  )}>
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-3 rounded-xl", config.color)}>
                          <Icon className="h-8 w-8" />
                        </div>
                        <div>
                          <Badge className={cn("mb-2", config.color)}>
                            {selectedNodeData.node_type}
                          </Badge>
                          <h2 className="font-display text-2xl font-bold">{selectedNodeData.title}</h2>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(selectedNodeData.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="prose-narrative">
                      <p className="text-lg leading-relaxed">
                        {selectedNodeData.description || 'No description yet. Click to add one.'}
                      </p>
                    </div>

                    {/* Connections Section */}
                    {(nodeConnections.incoming.length > 0 || nodeConnections.outgoing.length > 0) && (
                      <div className="mt-8 pt-6 border-t border-border/50">
                        <h4 className="text-sm font-medium text-muted-foreground mb-4">Connections</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {nodeConnections.incoming.length > 0 && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">Incoming</p>
                              <div className="space-y-1">
                                {nodeConnections.incoming.map(edge => {
                                  const source = storyMapNodes.find(n => n.id === edge.source_node_id);
                                  return source && (
                                    <button
                                      key={edge.id}
                                      onClick={() => navigateToNode(source.id)}
                                      className="w-full text-left text-sm p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
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
                              <p className="text-xs text-muted-foreground mb-2">Outgoing</p>
                              <div className="space-y-1">
                                {nodeConnections.outgoing.map(edge => {
                                  const target = storyMapNodes.find(n => n.id === edge.target_node_id);
                                  return target && (
                                    <button
                                      key={edge.id}
                                      onClick={() => navigateToNode(target.id)}
                                      className="w-full text-left text-sm p-2 rounded bg-background/50 hover:bg-background/80 transition-colors"
                                    >
                                      → {target.title}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Map className="h-20 w-20 text-muted-foreground/20 mb-6" />
              <h3 className="font-display text-2xl font-semibold mb-2">Select a Node</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a node from the navigator to view and edit its details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      <div className="w-72 border-l border-border bg-gradient-to-b from-primary/5 via-secondary/50 to-accent/5 backdrop-blur-sm flex flex-col">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold flex items-center gap-2">
            <Map className="h-4 w-4 text-primary" /> Story Stats
          </h3>
        </div>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-background/60 border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">Chapters</p>
                <p className="text-2xl font-bold">{chapters.length}</p>
              </Card>
              <Card className="p-4 bg-background/60 border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">Characters</p>
                <p className="text-2xl font-bold">{characters.length}</p>
              </Card>
              <Card className="p-4 bg-background/60 border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">Map Nodes</p>
                <p className="text-2xl font-bold">{storyMapNodes.length}</p>
              </Card>
              <Card className="p-4 bg-background/60 border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">Connections</p>
                <p className="text-2xl font-bold">{storyMapEdges.length}</p>
              </Card>
            </div>

            {/* Node Type Breakdown */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">By Type</h4>
              {Object.entries(NODE_CONFIG).map(([type, config]) => {
                const count = groupedNodes[type as NodeType].length;
                const Icon = config.icon;
                return (
                  <div 
                    key={type}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      config.color
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm capitalize">{type}s</span>
                    </div>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
