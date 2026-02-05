 import { create } from 'zustand';
 import { subscribeWithSelector } from 'zustand/middleware';
 
 export interface Snapshot {
   id: string;
   projectId: string;
   chapterId: string | null;
   chapterNumber: number | null;
   syncNumber: number;
   snapshotData: {
     characters: any[];
     lore: any[];
     outline: any;
     storyMap: { nodes: any[]; edges: any[] };
     stats: any;
   };
   createdAt: string;
 }
 
 export interface CanonState {
   id: string;
   projectId: string;
   charactersCanon: any[];
   worldCanon: any;
   plotCanon: any;
   themesCanon: any[];
   version: number;
   updatedAt: string;
 }
 
 interface TimelineState {
   // Current selections
   currentChapterId: string | null;
   currentSyncNumber: number | null;
   
   // Available data
   chapters: { id: string; number: number; title: string }[];
   snapshots: Snapshot[];
   canonState: CanonState | null;
   
   // Viewing mode
   isViewingSnapshot: boolean;
   activeSnapshot: Snapshot | null;
   
   // Loading states
   isLoading: boolean;
   isSyncing: boolean;
   
   // Actions
   setCurrentChapter: (chapterId: string | null) => void;
   setCurrentSync: (syncNumber: number | null) => void;
   setChapters: (chapters: { id: string; number: number; title: string }[]) => void;
   setSnapshots: (snapshots: Snapshot[]) => void;
   setCanonState: (canon: CanonState | null) => void;
   setIsLoading: (loading: boolean) => void;
   setIsSyncing: (syncing: boolean) => void;
   
   // Computed helpers
   getSnapshotsForChapter: (chapterId: string) => Snapshot[];
   getLatestSnapshot: () => Snapshot | null;
   
   // Reset
   reset: () => void;
 }
 
 const initialState = {
   currentChapterId: null,
   currentSyncNumber: null,
   chapters: [],
   snapshots: [],
   canonState: null,
   isViewingSnapshot: false,
   activeSnapshot: null,
   isLoading: false,
   isSyncing: false,
 };
 
 export const useTimelineStore = create<TimelineState>()(
   subscribeWithSelector((set, get) => ({
     ...initialState,
     
     setCurrentChapter: (chapterId) => {
       const { snapshots } = get();
       const chapterSnapshots = chapterId 
         ? snapshots.filter(s => s.chapterId === chapterId)
         : [];
       const latestSync = chapterSnapshots.length > 0 
         ? Math.max(...chapterSnapshots.map(s => s.syncNumber))
         : null;
       
       set({ 
         currentChapterId: chapterId,
         currentSyncNumber: latestSync,
         isViewingSnapshot: false,
         activeSnapshot: null,
       });
     },
     
     setCurrentSync: (syncNumber) => {
       const { currentChapterId, snapshots } = get();
       
       if (syncNumber === null) {
         set({ 
           currentSyncNumber: null,
           isViewingSnapshot: false,
           activeSnapshot: null,
         });
         return;
       }
       
       const snapshot = snapshots.find(
         s => s.chapterId === currentChapterId && s.syncNumber === syncNumber
       );
       
       set({
         currentSyncNumber: syncNumber,
         isViewingSnapshot: true,
         activeSnapshot: snapshot || null,
       });
     },
     
     setChapters: (chapters) => set({ chapters }),
     setSnapshots: (snapshots) => set({ snapshots }),
     setCanonState: (canon) => set({ canonState: canon }),
     setIsLoading: (isLoading) => set({ isLoading }),
     setIsSyncing: (isSyncing) => set({ isSyncing }),
     
     getSnapshotsForChapter: (chapterId) => {
       return get().snapshots
         .filter(s => s.chapterId === chapterId)
         .sort((a, b) => a.syncNumber - b.syncNumber);
     },
     
     getLatestSnapshot: () => {
       const { snapshots } = get();
       if (snapshots.length === 0) return null;
       return snapshots.reduce((latest, current) => 
         new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest
       );
     },
     
     reset: () => set(initialState),
   }))
 );