import { reddit, User } from "@devvit/web/server";

export async function getUserOrUndefined (username: string) {
    let user: User | undefined;
    try {
        user = await reddit.getUserByUsername(username);
    } catch {
        //
    }

    return user;
}
