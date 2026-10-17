import { ModeratorPermission, reddit, User } from "@devvit/web/server";

export async function getUserOrUndefined (username: string) {
    let user: User | undefined;
    try {
        user = await reddit.getUserByUsername(username);
    } catch {
        //
    }

    return user;
}

export async function isModerator (subredditName: string, username: string): Promise<boolean> {
    const modList = await reddit.getModerators({
        subredditName,
        username,
    }).all();

    return modList.length > 0;
}

export async function isBanned (subredditName: string, username: string): Promise<boolean> {
    const banList = await reddit.getBannedUsers({
        subredditName,
        username,
    }).all();

    return banList.length > 0;
}

export async function isContributor (subredditName: string, username: string): Promise<boolean> {
    const contributorList = await reddit.getApprovedUsers({
        subredditName,
        username,
    }).all();

    return contributorList.length > 0;
}

export async function hasPermissions (opts: {
    subredditName: string;
    username: string;
    requiredPerms: ModeratorPermission[];
}): Promise<boolean> {
    const user = await reddit.getUserByUsername(opts.username);
    const permissions = await user?.getModPermissionsForSubreddit(opts.subredditName);
    if (!permissions) {
        return false;
    }
    return permissions.includes("all") || opts.requiredPerms.every(perm => permissions.includes(perm));
}
