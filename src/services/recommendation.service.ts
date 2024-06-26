import { Follows, User } from "@prisma/client";

export class RecommendationService {


    public static getTopKRecommendedUsers(myFollowingsIdArray: Follows[], usersList: User[], k: 2 | 3, currUserId: string) {
        const alreadyFollowingUsersSet = this.getSetFromFollows(myFollowingsIdArray);
        const buckets = this.getBucukets(usersList, currUserId, alreadyFollowingUsersSet);
        const recommendationList = this.getRecommendationList(buckets, usersList.length, k);
        // console.log(recommendationList);
        return recommendationList.slice(0, k);
    }

    public static getSetFromFollows(myFollowingsIdArray: Follows[]) {
        const set = new Set<string>();
        myFollowingsIdArray.forEach(rec => set.add(rec.followingId));
        return set;
    }

    public static getBucukets(usersList: User[], currUserId: string, alreadyFollowingUsersSet: Set<string>) {
        const freqMapOfUsers = this.getFrequencyMap(usersList, currUserId, alreadyFollowingUsersSet);
        const buckets = new Array(usersList.length + 1);
        freqMapOfUsers.forEach(value => {
            if (!buckets[value.freq]) {
                buckets[value.freq] = [];
            }
            buckets[value.freq].push(value.user);
        });

        return buckets;
    }


    public static getFrequencyMap(usersList: User[], currUserId: string, alreadyFollowingUsersSet: Set<string>) {

        const freqMapOfUsers = new Map<string, { user: User, freq: number }>();

        for (const user of usersList) {
            if (user.id === currUserId) continue;
            if (alreadyFollowingUsersSet.has(user.id)) continue;


            const existingEntry = freqMapOfUsers.get(user.id);
            if (existingEntry) {
                existingEntry.freq += 1;
            } else {
                freqMapOfUsers.set(user.id, { user, freq: 1 });
            }
        }
        return freqMapOfUsers;
    }

    

    public static getRecommendationList(buckets: any[], userListSize: number, k: number) {
        const recommendationList = [];
        for (let i = userListSize - 1; i >= 0 && recommendationList.length < k; i--) {
            if (buckets[i]) {
                recommendationList.push(...buckets[i]);
            }
        }
        return recommendationList;
    }
}