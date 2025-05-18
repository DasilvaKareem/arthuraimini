import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, type User } from 'firebase/auth';
import { getFirestore, collection, getDocs, orderBy, query as firestoreQuery, limit as firestoreLimit } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Your Firebase configuration
// Replace these with your actual Firebase credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Check if we're running on the client and have a valid API key
const isBrowser = typeof window !== 'undefined';
const hasValidConfig = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

// Fallback sample videos for when Firebase is not available
const SAMPLE_VIDEOS = [
  {
    id: "sample1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "@creativeminds",
    description: "Big Buck Bunny - Open source animated short",
    likes: 1243,
    comments: 89,
    aspectRatio: "16:9",
    title: "Big Buck Bunny",
    tags: ["animation", "open-source"]
  },
  {
    id: "sample2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "@techexplorer",
    description: "Elephant's Dream - First Blender open movie",
    likes: 4521,
    comments: 132,
    aspectRatio: "16:9",
    title: "Elephant's Dream",
    tags: ["animation", "blender"]
  },
  {
    id: "sample3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "@aimasters",
    description: "For Bigger Blazes - Sample video",
    likes: 892,
    comments: 45,
    aspectRatio: "16:9",
    title: "For Bigger Blazes",
    tags: ["demo", "sample"]
  },
];

// Initialize Firebase only on client side with valid config
const firebaseApp = isBrowser && hasValidConfig
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : undefined;

// Initialize Firebase services only if app is defined
const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
const storage = firebaseApp ? getStorage(firebaseApp) : undefined;

// Anonymous authentication function
export const signInAnonymousUser = async (): Promise<User | null> => {
  if (!auth) return null;
  
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in anonymously:', error);
    return null;
  }
};

// Interface for PublishedStory
interface PublishedStory {
  id?: string;
  title: string;
  description?: string;
  authorId?: string;
  authorName?: string;
  coverImage?: string;
  tags: string[];
  isPublic?: boolean;
  viewCount: number;
  likeCount?: number;
  videoUrl?: string;
  videoType?: string;
  videoSize?: number;
  fileName?: string;
  createdAt?: FirebaseTimestamp;
  updatedAt: FirebaseTimestamp;
}

// Type alias for firebase timestamp to avoid 'any'
type FirebaseTimestamp = {
  toDate: () => Date;
  seconds: number;
  nanoseconds: number;
};

// Interface for video data used in the app
export interface VideoData {
  id: string;
  url: string;
  username: string;
  description?: string;
  likes: number;
  comments: number;
  aspectRatio: string;
  title?: string;
  authorName?: string;
  authorId?: string;
  tags?: string[];
}

// Function to check if a file exists in Firebase Storage
export const checkIfFileExists = async (path: string): Promise<boolean> => {
  if (!storage) return false;
  
  try {
    console.log(`🔍 DEBUG: Checking if file exists at path: ${path}`);
    const fileRef = ref(storage, path);
    // Try to get metadata, which will throw if file doesn't exist
    await getDownloadURL(fileRef);
    console.log(`✅ DEBUG: File exists at path: ${path}`);
    return true;
  } catch {
    console.log(`❌ DEBUG: File does not exist at path: ${path}`);
    return false;
  }
};

// Function to fetch published stories
export const fetchPublishedStories = async (limitCount = 10): Promise<PublishedStory[]> => {
  if (!db) {
    console.log("❌ DEBUG: Firestore DB is not initialized");
    return [];
  }
  
  try {
    console.log(`🔍 DEBUG: Looking for published stories with limit ${limitCount}`);
    const storiesRef = collection(db, 'PublicStories');
    
    console.log("🔍 DEBUG: Creating query with order by updatedAt DESC");
    const q = firestoreQuery(
      storiesRef,
      orderBy('updatedAt', 'desc'),
      firestoreLimit(limitCount)
    );
    
    console.log("🔍 DEBUG: Executing Firestore query for published stories");
    const querySnapshot = await getDocs(q);
    console.log(`🔍 DEBUG: Query returned ${querySnapshot.size} documents`);
    
    const stories: PublishedStory[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as PublishedStory;
      console.log(`🔍 DEBUG: Raw document data for ${doc.id}:`, JSON.stringify(data, null, 2));
      console.log(`🔍 DEBUG: Found story: ${doc.id} - ${data.title}`);
      console.log(`🔍 DEBUG: Video URL present: ${!!data.videoUrl}`);
      
      stories.push({
        ...data,
        id: doc.id
      });
    });
    
    return stories;
  } catch (error) {
    console.error('❌ DEBUG: Error fetching published stories:', error);
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
    }
    return [];
  }
};

// Main function to list videos from Firebase for the feed
export const listVideos = async (): Promise<VideoData[]> => {
  try {
    // Return sample videos if Firebase is not available
    if (!db || !storage) {
      console.log("⚠️ DEBUG: Firebase not initialized. Using sample videos instead.");
      return SAMPLE_VIDEOS;
    }
    
    // Fetch published stories with videos
    console.log("🔍 DEBUG: Starting to fetch published stories...");
    const stories = await fetchPublishedStories(20);
    console.log(`🔍 DEBUG: Found ${stories.length} published stories:`, 
      stories.map(s => ({ id: s.id, title: s.title })));
    
    // Filter stories to only include those with video URLs
    const videoStories = stories.filter(story => story.videoUrl);
    console.log(`🔍 DEBUG: Found ${videoStories.length} stories with videos`);
    console.log(`🔍 DEBUG: Video stories:`, videoStories.map(s => ({ 
      id: s.id, 
      title: s.title,
      videoUrl: s.videoUrl?.substring(0, 50) + '...' // Truncate URL for readability
    })));
    
    if (videoStories.length === 0) {
      console.log("❌ DEBUG: No videos found in published stories, using sample videos");
      return SAMPLE_VIDEOS;
    }
    
    // Map each story with video to VideoData format
    const videos = videoStories.map(story => {
      if (!story.id || !story.videoUrl) {
        console.log(`🔍 DEBUG: Story has incomplete data, skipping:`, story);
        return null;
      }
      
      console.log(`🔍 DEBUG: Processing video for story ${story.id} - ${story.title}`);
      
      const authorName = story.authorName || "Unknown Author";
      
      const videoData = {
        id: story.id,
        url: story.videoUrl,
        username: `@${authorName.toLowerCase().replace(/\s+/g, '')}`,
        title: story.title,
        description: story.description || "",
        likes: story.likeCount || Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 100) + 5,
        aspectRatio: "16:9",
        authorName: authorName,
        authorId: story.authorId || "gmbtygRco4Vl41gCNaWRzR4q9k02", // Use the provided default author ID if none exists
        tags: story.tags
      } as VideoData;
      
      console.log(`🔍 DEBUG: Created video data:`, {
        id: videoData.id,
        title: videoData.title,
        url: videoData.url?.substring(0, 50) + '...' // Truncate URL for readability
      });
      
      return videoData;
    }).filter((video): video is VideoData => video !== null);
    
    console.log(`✅ DEBUG: Found total of ${videos.length} videos from Firebase`);
    if (videos.length > 0) {
      console.log("🔍 DEBUG: Video URLs:");
      videos.forEach((video, i) => {
        console.log(`  ${i+1}. ${video.title} (${video.id}): ${video.url?.substring(0, 50)}...`);
      });
      return videos;
    } else {
      console.log("❌ DEBUG: No videos found in Firebase, using sample videos");
      return SAMPLE_VIDEOS;
    }
  } catch (error) {
    console.error('Error listing videos from Firebase:', error);
    return SAMPLE_VIDEOS;
  }
};

// Function to get streaming URL for a video
export const getStreamingUrl = async (storyId: string, fileName: string): Promise<string | null> => {
  if (!storage) return null;
  
  try {
    const filePath = `published/${storyId}/${fileName}`;
    console.log(`🔍 DEBUG: Getting download URL for: ${filePath}`);
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    console.log(`✅ DEBUG: Successfully got URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`❌ DEBUG: Error getting streaming URL for ${fileName}:`, error);
    // Log more specific error information
    if (error instanceof Error) {
      console.error(`Error name: ${error.name}, message: ${error.message}`);
    }
    return null;
  }
};

// Function to get video download URL from Firebase Storage (legacy)
export const getVideoURL = async (videoPath: string): Promise<string | null> => {
  if (!storage) return null;
  
  try {
    const videoRef = ref(storage, videoPath);
    const url = await getDownloadURL(videoRef);
    return url;
  } catch (error) {
    console.error('Error getting video download URL:', error);
    return null;
  }
};

// Export Firebase instances
export { auth, db, storage, firebaseApp, SAMPLE_VIDEOS }; 