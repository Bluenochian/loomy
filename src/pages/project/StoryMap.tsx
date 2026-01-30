import { useStory } from '@/context/StoryContext';
import { Map } from 'lucide-react';

export default function StoryMapPage() {
  const { storyMapNodes, storyMapEdges } = useStory();

  return (
    <div className="p-8 animate-fade-in">
      <h1 className="font-display text-3xl font-bold mb-4">Story Map</h1>
      <p className="text-muted-foreground mb-8">Visual representation of your narrative flow</p>
      
      <div className="min-h-[500px] bg-card rounded-xl border border-border p-6 relative">
        {storyMapNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Your story map will appear here as you build your narrative</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {storyMapNodes.map(node => (
              <div key={node.id} className="p-4 bg-secondary rounded-lg border border-border">
                <span className="text-xs text-primary capitalize">{node.node_type}</span>
                <h3 className="font-semibold mt-1">{node.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{node.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
