import { User } from "@prisma/client";

export class RecommendationService {


    public static getTopKRecommendedUsers(usersList: User[], k: 2 | 3, currUserId: string) {
        const buckets = this.getBucukets(usersList, currUserId);
        const recommendationList = this.getRecommendationList(buckets, usersList.length, k);
        console.log(recommendationList);

        return recommendationList.slice(0, k);

    }


    public static getFrequencyMap(usersList: User[], currUserId:string) {

        const freqMapOfUsers = new Map<string, { user: User, freq: number }>();

        for (const user of usersList) {
            if(user.id === currUserId) continue;

            const existingEntry = freqMapOfUsers.get(user.id);
            if (existingEntry) {
                existingEntry.freq += 1;
            } else {
                freqMapOfUsers.set(user.id, { user, freq: 1 });
            }
        }
        return freqMapOfUsers;
    }

    public static getBucukets(usersList: User[], currUserId:string) {
        const freqMapOfUsers = this.getFrequencyMap(usersList, currUserId);
        const buckets = new Array(usersList.length+1);
        freqMapOfUsers.forEach(value => {
            if(!buckets[value.freq]){
                buckets[value.freq] = [];
            }
            buckets[value.freq].push(value.user);
        });

        return buckets;
    }

    public static getRecommendationList(buckets: any[] , userListSize :number,  k: number ) {
        const recommendationList = [];
        for(let i = userListSize-1; i >= 0 && recommendationList.length < k ; i--){
            if(buckets[i]){
                recommendationList.push(...buckets[i]);
            }
        }
        return recommendationList;
    }
}