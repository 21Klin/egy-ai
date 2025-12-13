import { db } from "@/lib/firestore";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

//
// FOLLOW A USER
//
export async function followUser(currentUid: string, targetUid: string) {
  try {
    // Add to following list
    await setDoc(doc(db, "users", currentUid, "following", targetUid), {
      uid: targetUid,
      followedAt: Date.now(),
    });

    // Add to user's followers list
    await setDoc(doc(db, "users", targetUid, "followers", currentUid), {
      uid: currentUid,
      followedAt: Date.now(),
    });

    return true;
  } catch (err) {
    console.error("⚠️ Failed to follow user:", err);
    return false;
  }
}

//
// UNFOLLOW A USER
//
export async function unfollowUser(currentUid: string, targetUid: string) {
  try {
    // Remove from following list
    await deleteDoc(doc(db, "users", currentUid, "following", targetUid));

    // Remove from followers list
    await deleteDoc(doc(db, "users", targetUid, "followers", currentUid));

    return true;
  } catch (err) {
    console.error("⚠️ Failed to unfollow user:", err);
    return false;
  }
}

//
// CHECK IF CURRENT USER FOLLOWS TARGET
//
export async function isFollowing(currentUid: string, targetUid: string) {
  const ref = doc(db, "users", currentUid, "following", targetUid);
  const snap = await getDoc(ref);
  return snap.exists();
}
